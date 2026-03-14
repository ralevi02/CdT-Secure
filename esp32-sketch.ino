/*
 * CdT Secure – ESP32 Alarm Firmware
 * 
 * Connects to WiFi and posts sensor events to the Next.js API.
 * Reads the "should_alarm" response to control local buzzer.
 * 
 * Dependencies (Arduino Library Manager):
 *   - ArduinoJson  (Benoit Blanchon)
 *   - HTTPClient   (built-in ESP32)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ─── Config ──────────────────────────────────────────────────────────────────
const char* WIFI_SSID      = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD  = "YOUR_WIFI_PASSWORD";
const char* API_BASE_URL   = "https://YOUR-APP.vercel.app";
const char* ALARM_TOKEN    = "CdTSecure_X9kP2mVqLrN5wYjZ8dFh3tA7uEbQ";

// ─── Pins ─────────────────────────────────────────────────────────────────────
// Adjust these to match your wiring
const int SENSOR_PINS[] = {34, 35, 32, 33};   // GPIO for each sensor (INPUT_PULLUP)
const int ZONE_NUMBERS[] = {1, 2, 3, 4};        // Matches zone_number in the DB
const int NUM_ZONES      = 4;
const int BUZZER_PIN     = 25;

// ─── State ───────────────────────────────────────────────────────────────────
bool lastSensorState[4] = {false, false, false, false};
unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL_MS = 60000; // 1 minute

// ─── Setup ───────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);

  for (int i = 0; i < NUM_ZONES; i++) {
    pinMode(SENSOR_PINS[i], INPUT_PULLUP);
  }
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
bool postEvent(int zoneNumber, bool isOpen) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.begin(String(API_BASE_URL) + "/api/event");
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<128> doc;
  doc["zone_id"] = zoneNumber;
  doc["status"]  = isOpen;
  doc["token"]   = ALARM_TOKEN;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  bool shouldAlarm = false;

  if (code == 200) {
    String response = http.getString();
    StaticJsonDocument<64> res;
    deserializeJson(res, response);
    shouldAlarm = res["should_alarm"] | false;
    Serial.printf("Zone %d -> open:%d should_alarm:%d\n", zoneNumber, isOpen, shouldAlarm);
  } else {
    Serial.printf("POST /api/event failed: HTTP %d\n", code);
  }

  http.end();
  return shouldAlarm;
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(String(API_BASE_URL) + "/api/heartbeat");
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<64> doc;
  doc["token"] = ALARM_TOKEN;
  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  Serial.printf("Heartbeat -> HTTP %d\n", code);
  http.end();
}

// ─── Main Loop ───────────────────────────────────────────────────────────────
void loop() {
  bool anyAlarm = false;

  for (int i = 0; i < NUM_ZONES; i++) {
    // LOW when magnet is removed (door/window open), because INPUT_PULLUP
    bool isOpen = (digitalRead(SENSOR_PINS[i]) == HIGH);

    if (isOpen != lastSensorState[i]) {
      lastSensorState[i] = isOpen;
      bool shouldAlarm = postEvent(ZONE_NUMBERS[i], isOpen);
      if (shouldAlarm) anyAlarm = true;
    }

    if (lastSensorState[i]) anyAlarm = true;
  }

  // Control buzzer based on current alarm state
  // (only activates if server says should_alarm AND sensor is still open)
  digitalWrite(BUZZER_PIN, anyAlarm ? HIGH : LOW);

  // Periodic heartbeat
  if (millis() - lastHeartbeat > HEARTBEAT_INTERVAL_MS) {
    lastHeartbeat = millis();
    sendHeartbeat();
  }

  delay(200);
}
