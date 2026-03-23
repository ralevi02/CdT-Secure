/// <reference lib="webworker" />

const CACHE_NAME = "cdt-secure-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const VIBRATION_PATTERNS = {
  normal:   [200, 100, 200, 100, 200],
  urgente:  [400, 100, 400, 100, 400, 100, 400],
  silencio: [],
  sos:      [100, 50, 100, 50, 100, 200, 300, 50, 300, 50, 300, 200, 100, 50, 100, 50, 100],
};

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "CdT Secure", body: event.data.text() };
  }

  const isAlarm = data.alarm === true;
  const vibrationKey = data.vibration || "normal";
  const vibrate = VIBRATION_PATTERNS[vibrationKey] || VIBRATION_PATTERNS.normal;

  const title = data.title || "CdT Secure";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
    tag: data.tag || "cdt-alert",
    renotify: true,
    vibrate: vibrate,
    data: {
      url: data.url || "/",
      alarm: isAlarm,
      zoneId: data.zoneId || null,
    },
    requireInteraction: isAlarm,
    silent: vibrationKey === "silencio",
  };

  if (isAlarm) {
    options.actions = [
      { action: "disarm", title: "🔓 Desarmar" },
      { action: "emergency", title: "🚨 Emergencia" },
    ];
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  const action = event.action;
  const notifData = event.notification.data || {};

  if (action === "disarm") {
    event.notification.close();
    event.waitUntil(
      fetch("/api/disarm", { method: "POST" })
        .then(() => focusOrOpen("/"))
        .catch(() => focusOrOpen("/"))
    );
    return;
  }

  if (action === "emergency") {
    event.notification.close();
    event.waitUntil(self.clients.openWindow("tel:133"));
    return;
  }

  event.notification.close();
  event.waitUntil(focusOrOpen(notifData.url || "/"));
});

function focusOrOpen(url) {
  return self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    });
}
