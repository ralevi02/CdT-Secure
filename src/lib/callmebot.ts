export async function sendWhatsAppNotification(
  phone: string,
  apiKey: string,
  message: string
): Promise<void> {
  const encodedMsg = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMsg}&apikey=${apiKey}`;

  try {
    await fetch(url, { method: "GET", cache: "no-store" });
  } catch (err) {
    console.error("[CallMeBot] Failed to send notification:", err);
  }
}
