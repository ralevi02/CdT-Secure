"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createContact } from "@/lib/actions";
import { UserPlus, Loader2, Copy, Check, ChevronDown } from "lucide-react";

const CALLMEBOT_MESSAGE = "I allow callmebot to send me messages";
const CALLMEBOT_PHONE   = "+34 644 53 96 17";

export function CreateContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CALLMEBOT_MESSAGE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("phone_number", phone);
    fd.set("callmebot_api_key", apiKey);

    startTransition(async () => {
      const result = await createContact(fd);
      if (result.success) {
        setName(""); setPhone(""); setApiKey("");
      } else {
        setError(result.error ?? "Error al agregar contacto");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} data-glass="card" className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm relative">
      <p className="text-sm font-semibold">Nuevo contacto</p>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact_name" className="text-xs">Nombre</Label>
          <Input id="contact_name" placeholder="Ej: Juan" value={name} onChange={(e) => setName(e.target.value)} required className="h-8" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact_phone" className="text-xs">Teléfono WhatsApp</Label>
          <Input id="contact_phone" placeholder="+56912345678" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-8" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact_apikey" className="text-xs">API Key de CallMeBot</Label>
        <Input id="contact_apikey" placeholder="Ej: 4490065" value={apiKey} onChange={(e) => setApiKey(e.target.value)} required className="h-8" />
      </div>

      {/* How to get API key — collapsible */}
      <details data-glass="card" className="group rounded-xl border bg-card shadow-sm overflow-hidden relative">
        <summary className="flex cursor-pointer items-center justify-between px-3 py-2.5 text-xs font-semibold list-none [&::-webkit-details-marker]:hidden">
          ¿Cómo obtener mi API Key?
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="flex flex-col gap-3 border-t border-border/50 px-3 pb-3 pt-2.5">
          <ol className="flex flex-col gap-2 text-xs text-muted-foreground list-none">
            <li className="flex items-start gap-2">
              <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold mt-px">1</span>
              <span className="leading-relaxed">Agrega el número <span className="font-semibold text-foreground">{CALLMEBOT_PHONE}</span> a tus contactos de WhatsApp.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold mt-px">2</span>
              <span className="leading-relaxed">Envíale este mensaje exacto por WhatsApp:</span>
            </li>
          </ol>

          <div data-glass="btn" className="flex items-center gap-2 rounded-xl px-3 py-2 relative overflow-hidden">
            <code className="flex-1 text-xs font-mono text-foreground">{CALLMEBOT_MESSAGE}</code>
            <button
              type="button"
              onClick={handleCopy}
              data-glass="btn"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-all active:scale-[0.97] shrink-0 relative overflow-hidden"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold mt-px">3</span>
            <span className="leading-relaxed">Recibirás un mensaje con tu API Key. Pégala en el campo de arriba.</span>
          </p>
        </div>
      </details>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button type="submit" size="sm" disabled={isPending} className="self-end gap-1.5">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Agregar</>}
      </Button>
    </form>
  );
}
