"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createContact } from "@/lib/actions";
import { UserPlus, Loader2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

const CALLMEBOT_MESSAGE = "I allow callmebot to send me messages";
const CALLMEBOT_PHONE   = "+34 644 53 96 17";

export function CreateContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
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
      <div className="rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setHelpOpen((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors"
        >
          <span>¿Cómo obtener mi API Key?</span>
          {helpOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {helpOpen && (
          <div className="px-3 py-3 flex flex-col gap-3 border-t border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <ol className="flex flex-col gap-1.5 text-xs text-muted-foreground list-none">
              <li className="flex gap-2"><span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">1.</span>Agrega el número <span className="font-semibold text-foreground">{CALLMEBOT_PHONE}</span> a tus contactos de WhatsApp.</li>
              <li className="flex gap-2"><span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">2.</span>Envíale este mensaje exacto por WhatsApp:</li>
            </ol>

            {/* Message to copy */}
            <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
              <code className="flex-1 text-xs font-mono text-foreground">{CALLMEBOT_MESSAGE}</code>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors bg-primary/10 text-primary hover:bg-primary/20 shrink-0"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">3.</span> Recibirás un mensaje con tu API Key. Pégala en el campo de arriba.
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button type="submit" size="sm" disabled={isPending} className="self-end gap-1.5">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Agregar</>}
      </Button>
    </form>
  );
}
