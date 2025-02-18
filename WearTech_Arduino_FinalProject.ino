#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <TinyGPS++.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Wi-Fi credentials
const char* WIFI_SSID = "Ajhe";
const char* WIFI_PASSWORD = "cobatebak";

// Firebase credentials
const char* API_KEY = "AIzaSyCrfQNw5y_G8b1txPQK6H_TPvyeInYz0sI";
const char* DATABASE_URL = "https://weartech-marathonmaster.firebaseio.com";
const char* FIREBASE_PROJECT_ID = "weartech-marathonmaster";
const char* USER_EMAIL = "name";
const char* USER_PASSWORD = "1234567890";

// Firebase objects
FirebaseConfig config;
FirebaseAuth auth;
FirebaseData fbdo;

// GPS setup
TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // Use Serial2 for GPS (TX: GPIO17, RX: GPIO16)

// NTP client setup
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0, 60000); // UTC timezone

// LCD configuration
LiquidCrystal_I2C lcd(0x27, 16, 2); // Adjust address as needed

// Buzzer configuration
#define BUZZER_PIN 5 // GPIO5 for the buzzer

// Timer variables
unsigned long fetchMillis = 0;
const long fetchInterval = 10000; // 10 seconds

// Speed threshold
int speedThreshold = 0; // Default value (will be updated from Firestore)

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Firebase configuration
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  // Initialize Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  if (Firebase.ready()) {
    Serial.println("Firebase initialized successfully!");
  } else {
    Serial.println("Failed to initialize Firebase:");
    Serial.println(config.signer.tokens.error.message.c_str());
  }

  // Initialize GPS and NTP client
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17); // RX = 16, TX = 17
  timeClient.begin();

  // Initialize LCD
  Wire.begin(25, 26); // SDA: GPIO25, SCL: GPIO26
  lcd.begin(16, 2);
  lcd.setBacklight(1);
  lcd.clear();
  lcd.print("Initializing...");
  delay(2000);
  lcd.clear();

  // Initialize Buzzer
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // Initial fetch of speed threshold
  fetchSpeedThreshold();
}

void loop() {
  // Update GPS data
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Ensure NTP client is updated
  timeClient.update();

  // Update speed threshold every 10 seconds
  if (millis() - fetchMillis >= fetchInterval) {
    fetchMillis = millis();
    fetchSpeedThreshold();
  }

  // Check if GPS data is updated
  if (gps.location.isUpdated()) {
    double latitude = gps.location.lat();
    double longitude = gps.location.lng();
    float speed = gps.speed.kmph();
    String timestamp = getFormattedTimestamp();

    // Display speed and threshold on LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Speed: ");
    lcd.print(speed, 1);
    lcd.print(" km/h");
    lcd.setCursor(0, 1);
    lcd.print("Threshold: ");
    lcd.print(speedThreshold);

    // Check speed threshold and activate buzzer
    if (speed < speedThreshold) {
      digitalWrite(BUZZER_PIN, HIGH); // Turn on the buzzer
    } else {
      digitalWrite(BUZZER_PIN, LOW); // Turn off the buzzer
    }

    // Log and insert data into Firestore
    Serial.printf("Latitude: %.6f, Longitude: %.6f, Speed: %.2f km/h, Threshold: %d km/h\n", latitude, longitude, speed, speedThreshold);
    createFirestoreDocument(latitude, longitude, speed, timestamp);

    // Delay 1 second before the next iteration
    delay(1000);
  }
}

String getFormattedTimestamp() {
  time_t epochTime = timeClient.getEpochTime();
  char timestamp[40];
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", gmtime(&epochTime));
  return String(timestamp);
}

void createFirestoreDocument(double lat, double lng, float spd, String timestamp) {
  if (Firebase.ready()) {
    FirebaseJson content;
    content.set("fields/latitude/doubleValue", lat);
    content.set("fields/longitude/doubleValue", lng);
    content.set("fields/speed/doubleValue", spd);
    content.set("fields/timestamp/timestampValue", timestamp);

    if (Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "(default)", "gps_data/" + timestamp, content.raw())) {
      Serial.println("Document created successfully!");
    } else {
      Serial.println("Failed to create document:");
      Serial.println(fbdo.errorReason());
    }
  }
}

void fetchSpeedThreshold() {
  String documentPath = "set_speed/speed_threshold"; // Document path
  if (Firebase.Firestore.getDocument(&fbdo, FIREBASE_PROJECT_ID, "(default)", documentPath.c_str())) {
    FirebaseJson json;
    json.setJsonData(fbdo.payload());
    FirebaseJsonData jsonData;
    if (json.get(jsonData, "fields/speed/integerValue")) {
      speedThreshold = jsonData.intValue;
      Serial.printf("Updated speed threshold: %d km/h\n", speedThreshold);

      // Display the updated speed threshold on the LCD
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Threshold: ");
      lcd.setCursor(0, 1);
      lcd.print(speedThreshold);
    } else {
      Serial.println("Speed field not found in the document.");
    }
  } else {
    Serial.println("Failed to fetch speed threshold:");
    Serial.println(fbdo.errorReason());
  }
}

void tokenStatusCallback(TokenInfo info) {
  Serial.printf("Token Info: type = %d, status = %d\n", info.type, info.status);
}
