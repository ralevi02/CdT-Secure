"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createContact } from "@/lib/actions";
import { UserPlus, Loader2 } from "lucide-react";

export function CreateContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-sm font-semibold">Nuevo contacto</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact_name" className="text-xs">Nombre</Label>
          <Input id="contact_name" placeholder="Ej: Juan" value={name} onChange={(e) => setName(e.target.value)} required className="h-8" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact_phone" className="text-xs">Teléfono (WhatsApp)</Label>
          <Input id="contact_phone" placeholder="+56912345678" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-8" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact_apikey" className="text-xs">API Key de CallMeBot</Label>
        <Input id="contact_apikey" placeholder="Obtén la key enviando 'I allow callmebot.com to send me messages' a +34 644 53 96 17 por WhatsApp" value={apiKey} onChange={(e) => setApiKey(e.target.value)} required className="h-8" />
        <p className="text-xs text-muted-foreground">
          Envía <code className="bg-muted px-1 rounded">I allow callmebot.com to send me messages</code> al <strong>+34 644 53 96 17</strong> por WhatsApp para obtener tu key.
        </p>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" size="sm" disabled={isPending} className="self-end gap-1.5">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Agregar</>}
      </Button>
    </form>
  );
}
