"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Terminal,
  ChevronDown,
  ChevronUp,
  Play,
  Copy,
  Check,
  Zap,
  Wifi,
  MessageCircle,
  AlertTriangle,
  Smartphone,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type HttpMethod = "POST" | "GET";
type Status = "idle" | "loading" | "success" | "error";

interface EndpointField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "password";
  placeholder?: string;
  defaultValue?: string;
}

interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  description: string;
  icon: React.ReactNode;
  fields: EndpointField[];
  responseExample: object;
  notes?: string[];
}

// ─── Config ─────────────────────────────────────────────────────────────────

const ENDPOINTS: Endpoint[] = [
  {
    id: "event",
    method: "POST",
    path: "/api/event",
    description: "Recibe un evento de sensor desde el ESP32. Registra el log, actualiza el estado del dispositivo, envía notificaciones y retorna si debe sonar el parlante.",
    icon: <Zap className="h-4 w-4" />,
    fields: [
      { key: "zone_id",  label: "zone_id",  type: "number",  placeholder: "1", defaultValue: "1" },
      { key: "status",   label: "status",   type: "boolean", placeholder: "true / false", defaultValue: "true" },
      { key: "token",    label: "token",    type: "password", placeholder: "ALARM_TOKEN", defaultValue: "" },
    ],
    responseExample: { should_alarm: true },
    notes: [
      "zone_id debe coincidir con zone_number en la tabla zones.",
      "status: true = sensor abierto / false = cerrado.",
      "should_alarm: true solo si status=true Y trigger_local_alarm=true en la zona.",
      "Si notifications_enabled=true y hay contactos activos, envía WhatsApp.",
    ],
  },
  {
    id: "heartbeat",
    method: "POST",
    path: "/api/heartbeat",
    description: "Señal de vida del ESP32. Actualiza last_seen en device_status para que el dashboard marque el dispositivo como Online.",
    icon: <Wifi className="h-4 w-4" />,
    fields: [
      { key: "token", label: "token", type: "password", placeholder: "ALARM_TOKEN", defaultValue: "" },
    ],
    responseExample: { ok: true },
    notes: [
      "El ESP32 debe llamar a este endpoint cada ~60 segundos.",
      "El dashboard marca Offline si last_seen supera heartbeat_timeout_mins.",
    ],
  },
  {
    id: "test-notification",
    method: "POST",
    path: "/api/test-notification",
    description: "Envía un mensaje WhatsApp de prueba a un contacto específico de la tabla notification_contacts.",
    icon: <MessageCircle className="h-4 w-4" />,
    fields: [
      { key: "contact_id", label: "contact_id (UUID)", type: "text", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", defaultValue: "" },
    ],
    responseExample: { ok: true },
    notes: [
      "El contact_id es el UUID de la fila en notification_contacts.",
      "Usa la phone_number y callmebot_api_key almacenadas en la DB.",
      "No requiere ALARM_TOKEN — es un endpoint interno.",
    ],
  },
  {
    id: "test-push",
    method: "POST",
    path: "/api/test-push",
    description: "Envía una notificación push de prueba a todos los dispositivos suscritos. Útil para verificar que la PWA y el service worker están funcionando.",
    icon: <Smartphone className="h-4 w-4" />,
    fields: [],
    responseExample: { ok: true, subscriptions: 1 },
    notes: [
      "No requiere parámetros — envía a todas las suscripciones activas.",
      "Si no hay suscripciones, retorna error 404 con mensaje explicativo.",
      "Muestra los endpoints registrados para depuración.",
      "Primero activa el toggle 'Notificaciones push' en /notifications.",
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function DevPage() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" data-glass="item" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 relative">
          <Terminal className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Developer</h1>
          <p className="text-sm text-muted-foreground">Documentación y tester de API</p>
        </div>
        <span className="ml-auto rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Solo desarrollo
        </span>
      </div>

      {/* Endpoints */}
      {ENDPOINTS.map((ep) => (
        <EndpointCard key={ep.id} endpoint={ep} />
      ))}

      {/* ESP32 Quick Reference */}
      <Esp32Reference />
    </div>
  );
}

// ─── Endpoint Card ────────────────────────────────────────────────────────────

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(endpoint.fields.map((f) => [f.key, f.defaultValue ?? ""]))
  );
  const [status, setStatus] = useState<Status>("idle");
  const [response, setResponse] = useState<string | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    setStatus("loading");
    setResponse(null);
    setHttpStatus(null);

    // Build body — coerce types
    const body: Record<string, unknown> = {};
    for (const field of endpoint.fields) {
      const raw = values[field.key];
      if (field.type === "number") body[field.key] = Number(raw);
      else if (field.type === "boolean") body[field.key] = raw === "true";
      else body[field.key] = raw;
    }

    try {
      const res = await fetch(endpoint.path, {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setHttpStatus(res.status);
      setResponse(JSON.stringify(data, null, 2));
      setStatus(res.ok ? "success" : "error");
    } catch (err) {
      setStatus("error");
      setResponse(String(err));
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const bodyPreview = JSON.stringify(
    Object.fromEntries(
      endpoint.fields.map((f) => {
        const raw = values[f.key] || f.placeholder || "";
        if (f.type === "number") return [f.key, Number(raw) || 0];
        if (f.type === "boolean") return [f.key, raw === "true"];
        if (f.type === "password") return [f.key, "***"];
        return [f.key, raw];
      })
    ),
    null, 2
  );

  return (
    <div data-glass="card" className="rounded-xl border bg-card shadow-sm overflow-hidden relative">
      {/* Header row */}
      <button
        className="flex w-full items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className={cn(
          "rounded-md px-2 py-0.5 text-xs font-bold font-mono",
          "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
        )}>
          {endpoint.method}
        </span>
        <span className="font-mono text-sm font-semibold">{endpoint.path}</span>
        <div className="ml-auto flex items-center gap-2 text-muted-foreground">
          {endpoint.icon}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t flex flex-col gap-0">
          {/* Description */}
          <div className="px-4 py-3 bg-muted/20">
            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
            {endpoint.notes && (
              <ul className="mt-2 flex flex-col gap-1">
                {endpoint.notes.map((note, i) => (
                  <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-3 px-4 py-4 border-t">
            {endpoint.fields.length > 0 && <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Request body</p>}
            {endpoint.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
                <label className="flex items-center gap-2 text-xs font-mono font-medium">
                  <span className="text-primary">{field.key}</span>
                  <span className="text-muted-foreground text-[10px]">{field.type}</span>
                </label>
                {field.type === "boolean" ? (
                  <div className="flex gap-2">
                    {["true", "false"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setValues((p) => ({ ...p, [field.key]: v }))}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-xs font-mono font-semibold border transition-colors",
                          values[field.key] === v
                            ? v === "true"
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-red-500 text-white border-red-500"
                            : "border-border text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type={field.type === "password" ? "text" : field.type === "number" ? "number" : "text"}
                    placeholder={field.placeholder}
                    value={values[field.key]}
                    onChange={(e) => setValues((p) => ({ ...p, [field.key]: e.target.value }))}
                    className="h-8 w-full rounded-md border bg-background px-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
              </div>
            ))}

            {/* Body preview */}
            {endpoint.fields.length > 0 && (
              <div className="rounded-lg bg-slate-900 dark:bg-slate-950 p-3 font-mono text-xs text-slate-300 whitespace-pre">
                {bodyPreview}
              </div>
            )}

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {status === "loading" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Ejecutar
            </button>
          </div>

          {/* Response */}
          {response && (
            <div className="border-t">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 font-mono">Response</span>
                  {httpStatus && (
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold font-mono",
                      httpStatus >= 200 && httpStatus < 300
                        ? "bg-emerald-800 text-emerald-300"
                        : "bg-red-800 text-red-300"
                    )}>
                      {httpStatus}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <pre className="px-4 py-3 bg-slate-900 dark:bg-slate-950 font-mono text-xs whitespace-pre-wrap text-slate-300 border-t border-slate-800">
                {response}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ESP32 Quick Reference ────────────────────────────────────────────────────

function Esp32Reference() {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const snippets: { id: string; label: string; code: string }[] = [
    {
      id: "event",
      label: "POST /api/event (sensor abierto)",
      code: `// En el loop del ESP32
StaticJsonDocument<128> doc;
doc["zone_id"] = 1;
doc["status"]  = true;
doc["token"]   = "CdTSecure_X9kP2mVqLrN5wYjZ8dFh3tA7uEbQ";

String body;
serializeJson(doc, body);

HTTPClient http;
http.begin("https://TU-APP.vercel.app/api/event");
http.addHeader("Content-Type", "application/json");
int code = http.POST(body);

// Leer respuesta
if (code == 200) {
  StaticJsonDocument<64> res;
  deserializeJson(res, http.getString());
  bool shouldAlarm = res["should_alarm"];
  digitalWrite(BUZZER_PIN, shouldAlarm ? HIGH : LOW);
}
http.end();`,
    },
    {
      id: "heartbeat",
      label: "POST /api/heartbeat (señal de vida)",
      code: `// Cada 60 segundos
StaticJsonDocument<64> doc;
doc["token"] = "CdTSecure_X9kP2mVqLrN5wYjZ8dFh3tA7uEbQ";
String body;
serializeJson(doc, body);

HTTPClient http;
http.begin("https://TU-APP.vercel.app/api/heartbeat");
http.addHeader("Content-Type", "application/json");
http.POST(body);
http.end();`,
    },
  ];

  return (
    <div data-glass="card" className="rounded-xl border bg-card shadow-sm overflow-hidden relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
      >
        <span className="text-lg">🔧</span>
        <div className="flex-1">
          <p className="text-sm font-semibold">ESP32 — Referencia rápida</p>
          <p className="text-xs text-muted-foreground">Snippets de Arduino para integrar con la API</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && <div className="flex flex-col gap-4 px-4 pb-4 border-t">
        {snippets.map((s) => (
          <div key={s.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <button
                onClick={() => copy(s.id, s.code)}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {copied === s.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied === s.id ? "Copiado" : "Copiar"}
              </button>
            </div>
            <pre className="rounded-lg bg-slate-900 dark:bg-slate-950 px-4 py-3 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre">
              {s.code}
            </pre>
          </div>
        ))}

        {/* Variables reference */}
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-3">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">⚠️ Variables a reemplazar</p>
          <div className="flex flex-col gap-1 font-mono text-xs">
            {[
              ["TU-APP.vercel.app", "URL de tu app en Vercel"],
              ["ALARM_TOKEN", "Valor de ALARM_TOKEN en .env.local"],
              ["BUZZER_PIN", "Pin GPIO del parlante/buzzer"],
            ].map(([key, desc]) => (
              <div key={key} className="flex gap-3">
                <span className="text-amber-600 dark:text-amber-400 shrink-0">{key}</span>
                <span className="text-muted-foreground">→ {desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>}
    </div>
  );
}
