# CdT Secure – Contexto para GitHub Copilot (ESP32)

## Descripción del proyecto

Sistema de alarma residencial IoT. Un ESP32 lee sensores magnéticos (puertas/ventanas) y envía eventos HTTP POST a una API en Vercel (Next.js). La API registra los eventos en Supabase, envía notificaciones WhatsApp (CallMeBot) y llamadas telefónicas (Twilio), y retorna si debe sonar el parlante/buzzer local.

---

## Archivo principal: `esp32-sketch.ino`

El sketch ya está implementado. Lo que necesito es **agregar o configurar zonas (puertos GPIO)**.

### Estructura del sketch

```cpp
// ─── Pines a configurar ───────────────────────────────────────────
const int SENSOR_PINS[]  = {34, 35, 32, 33};  // GPIOs conectados a sensores
const int ZONE_NUMBERS[] = {1, 2, 3, 4};       // IDs de zona (deben coincidir con la DB)
const int NUM_ZONES      = 4;                   // Cantidad de zonas activas
const int BUZZER_PIN     = 25;                  // GPIO del parlante/buzzer
```

### Cómo funciona la lectura de sensores

- Los sensores magnéticos se conectan con `INPUT_PULLUP`
- `LOW` = sensor cerrado (imán presente) → puerta/ventana cerrada ✅  
- `HIGH` = sensor abierto (imán alejado) → puerta/ventana abierta ⚠️

```cpp
bool isOpen = (digitalRead(SENSOR_PINS[i]) == HIGH);
```

### API Contract

**POST /api/event** — se llama cuando un sensor cambia de estado:
```json
{
  "zone_id": 1,       // número entero, coincide con zone_number en DB
  "status": true,     // true = sensor abierto, false = cerrado
  "token": "CdTSecure_X9kP2mVqLrN5wYjZ8dFh3tA7uEbQ"
}
```

Respuesta:
```json
{ "should_alarm": true }  // true = activar buzzer local
```

**POST /api/heartbeat** — señal de vida, se envía cada 60 segundos:
```json
{ "token": "CdTSecure_X9kP2mVqLrN5wYjZ8dFh3tA7uEbQ" }
```

---

## GPIOs disponibles en ESP32

| GPIO | ADC | Notas |
|------|-----|-------|
| 34   | ✅  | Solo entrada |
| 35   | ✅  | Solo entrada |
| 32   | ✅  | Entrada/Salida |
| 33   | ✅  | Entrada/Salida |
| 26   | ✅  | Entrada/Salida |
| 27   | ✅  | Entrada/Salida |
| 14   | ✅  | Entrada/Salida |
| 13   | ✅  | Entrada/Salida |
| 4    | —   | Entrada/Salida |
| 16   | —   | Entrada/Salida |
| 17   | —   | Entrada/Salida |
| 18   | —   | Entrada/Salida |
| 19   | —   | Entrada/Salida |
| 21   | —   | Entrada/Salida (I2C SDA) |
| 22   | —   | Entrada/Salida (I2C SCL) |
| 23   | —   | Entrada/Salida |

**GPIOs a EVITAR:**
- GPIO 0, 2, 15 → usados en boot
- GPIO 6–11 → conectados a la flash interna
- GPIO 36, 39 → solo entrada, sin pullup interno

---

## Variables a personalizar

```cpp
const char* WIFI_SSID     = "TU_RED_WIFI";
const char* WIFI_PASSWORD = "TU_CONTRASEÑA";
const char* API_BASE_URL  = "https://TU-APP.vercel.app";
const char* ALARM_TOKEN   = "CdTSecure_X9kP2mVqLrN5wYjZ8dFh3tA7uEbQ";

// ── Zonas: agrega o quita según tu instalación ──
const int SENSOR_PINS[]  = {34, 35, 32, 33};  // un GPIO por sensor
const int ZONE_NUMBERS[] = {1,  2,  3,  4};    // ID de zona en la base de datos
const int NUM_ZONES      = 4;

const int BUZZER_PIN = 25;  // GPIO del parlante (OUTPUT)
```

> ⚠️ **Importante:** `ZONE_NUMBERS[i]` debe coincidir con el `zone_number` que creaste en la app web (página /zones).

---

## Dependencias (Arduino Library Manager)

- `ArduinoJson` by Benoit Blanchon (versión 6.x)
- `HTTPClient` — incluida en el paquete esp32 de Arduino
- `WiFi` — incluida en el paquete esp32 de Arduino

**Board:** ESP32 Dev Module  
**Upload Speed:** 115200  
**Baud rate Serial Monitor:** 115200

---

## Prompt sugerido para Copilot Chat

Copia y pega esto en el chat de Copilot:

```
Estoy trabajando en el archivo esp32-sketch.ino del proyecto CdT Secure.
Es un sistema de alarma con ESP32 que lee sensores magnéticos en GPIOs con INPUT_PULLUP.
LOW = cerrado, HIGH = abierto.

Tengo estas variables de configuración:
  const int SENSOR_PINS[]  = {34, 35, 32, 33};
  const int ZONE_NUMBERS[] = {1, 2, 3, 4};
  const int NUM_ZONES      = 4;
  const int BUZZER_PIN     = 25;

Quiero [DESCRIBE LO QUE NECESITAS, por ejemplo:
  - "agregar un quinto sensor en el GPIO 26, zona número 5"
  - "configurar solo 1 sensor en el GPIO 34, zona 1"
  - "cambiar el buzzer al GPIO 27"
  - "agregar un LED indicador en el GPIO 2 que parpadee cuando hay alarma"
]

El sketch envía POST /api/event con { zone_id: número, status: bool, token: string }
y recibe { should_alarm: bool } para controlar el buzzer.
```
