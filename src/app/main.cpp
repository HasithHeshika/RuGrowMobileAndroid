#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <Adafruit_NeoPixel.h>
#include <DHT.h>
#include <BH1750.h>
#include <Wire.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// WiFi Credentials
#define WIFI_SSID "Dialog 4G 641"
#define WIFI_PASSWORD "CB465bEF"

// Firebase Credentials
#define API_KEY "AIzaSyDWuV47g8p2qNS0uQTNFpYTc2666NteSZI"
#define DATABASE_URL "https://rugrow-iot-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define FIREBASE_PROJECT_ID "rugrow-iot"

// --- IMPORTANT ---
// PLANT ID from Firestore
#define PLANT_ID "LWPon1uP6aqHoUIZUuhp"


// GPIO Pin Definitions - CORRECTED FOR YOUR ACTUAL WIRING
#define DHT_PIN 4      // GPIO4 → DHT22 Temperature Sensor
#define FAN_PIN 5      // GPIO5 → Logic Shifter → Fan Relay
#define PUMP_PIN 14    // GPIO14 → Logic Shifter → Pump Relay
#define SOIL_PIN 1     // GPIO1 → Capacitive Soil Moisture Sensor (Analog)
#define I2C_SDA 10     // GPIO10 → I2C SDA for BH1750
#define I2C_SCL 11     // GPIO11 → I2C SCL for BH1750

// Built-in RGB LED (NeoPixel)
#define RGB_LED_PIN 48 // GPIO48 - Built-in RGB LED on ESP32-S3
#define NUM_PIXELS 1   // Only 1 RGB LED

// DHT22 Sensor
#define DHTTYPE DHT22  // DHT22 (AM2302)

// Create sensor objects
Adafruit_NeoPixel rgbLed(NUM_PIXELS, RGB_LED_PIN, NEO_GRB + NEO_KHZ800);
DHT dht(DHT_PIN, DHTTYPE);
BH1750 lightMeter;

// Timing variables for sensor readings
unsigned long lastSensorRead = 0;
const unsigned long sensorReadInterval = 2000; // Read every 2 seconds

// BH1750 sensor status
bool bh1750Available = false;

// Firebase Objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
unsigned long lastFirebaseSend = 0;
const unsigned long firebaseSendInterval = 10000; // Send every 10 seconds
bool signupOK = false;

// WiFi connection function
void connectWiFi() {
  Serial.print("🌐 Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
  }
}

// Function to calculate dew point from temperature and humidity
float calculateDewPoint(float temperature, float humidity) {
  // Magnus-Tetens approximation
  // Constants for temperatures above 0°C
  const float a = 17.27;
  const float b = 237.7;
  
  float alpha = ((a * temperature) / (b + temperature)) + log(humidity / 100.0);
  float dewPoint = (b * alpha) / (a - alpha);
  
  return dewPoint;
}

// Function to calculate absolute humidity (g/m³)
float calculateAbsoluteHumidity(float temperature, float relativeHumidity) {
  // Constants
  const float a = 17.27;
  const float b = 237.7;
  
  // Calculate saturation vapor pressure (hPa)
  float svp = 6.112 * exp((a * temperature) / (b + temperature));
  
  // Calculate actual vapor pressure
  float avp = svp * (relativeHumidity / 100.0);
  
  // Calculate absolute humidity (g/m³)
  // AH = (avp * 2.1674) / (temperature + 273.15)
  float absoluteHumidity = (avp * 2.1674) / (temperature + 273.15);
  
  return absoluteHumidity;
} 


void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n╔════════════════════════════════════╗");
  Serial.println("║  RuGrow IoT - Realtime Database   ║");
  Serial.println("╚════════════════════════════════════╝\n");
  
  Serial.println("Initializing GPIO pins...");
  
  // Initialize RGB LED
  rgbLed.begin();
  rgbLed.setBrightness(50); // Set brightness (0-255)
  rgbLed.setPixelColor(0, rgbLed.Color(0, 0, 255)); // Blue on startup
  rgbLed.show();
  Serial.print("✓ RGB_LED:  GPIO");
  Serial.print(RGB_LED_PIN);
  Serial.println(" → BLUE (Ready)");
  
  // Initialize I2C for BH1750
  Wire.begin(I2C_SDA, I2C_SCL);
  Serial.print("✓ I2C:      SDA=GPIO");
  Serial.print(I2C_SDA);
  Serial.print(", SCL=GPIO");
  Serial.println(I2C_SCL);
  
  // Initialize BH1750 Light Sensor
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    bh1750Available = true;
    Serial.println("✓ BH1750:   Light sensor initialized");
  } else {
    bh1750Available = false;
    Serial.println("⚠ BH1750:   Not detected - check wiring!");
  }
  
  // Initialize DHT22 sensor
  dht.begin();
  Serial.print("✓ DHT22:    GPIO");
  Serial.print(DHT_PIN);
  Serial.println(" → Initialized");
  delay(2000); // DHT22 needs time to stabilize
  
  // Initialize Soil Moisture Sensor (analog input)
  pinMode(SOIL_PIN, INPUT);
  Serial.print("✓ SOIL:     GPIO");
  Serial.print(SOIL_PIN);
  Serial.println(" → Analog Input Ready");
  
  // Initialize pump pin
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW);   // Pump OFF at startup
  Serial.print("✓ PUMP_PIN: GPIO");
  Serial.print(PUMP_PIN);
  Serial.println(" → OFF");
  
  // Initialize fan pin
  pinMode(FAN_PIN, OUTPUT);
  digitalWrite(FAN_PIN, LOW);    // Fan OFF at startup
  Serial.print("✓ FAN_PIN:  GPIO");
  Serial.print(FAN_PIN);
  Serial.println(" → OFF");
  
  // Connect to WiFi
  connectWiFi();
  
  // Firebase Configuration
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  
  // Sign up anonymously
  Serial.println("🔑 Signing up to Firebase...");
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("✓ Firebase signup successful");
    signupOK = true;
  } else {
    Serial.print("❌ Signup failed: ");
    Serial.println(config.signer.signupError.message.c_str());
    Serial.println("\n⚠️  Enable Anonymous Authentication in Firebase Console");
  }
  
  config.token_status_callback = tokenStatusCallback;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  Serial.println("\n╔════════════════════════════════════╗");
  Serial.println("║       Setup Complete!              ║");
  Serial.println("╚════════════════════════════════════╝\n");
  Serial.println("Starting monitoring...\n");
  
  delay(2000);
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - lastSensorRead >= sensorReadInterval) {
    lastSensorRead = currentMillis;
    
    // Read sensors
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int soilRaw = analogRead(SOIL_PIN);
    int soilPercent = map(soilRaw, 4095, 0, 0, 100);
    soilPercent = constrain(soilPercent, 0, 100);
    float lux = bh1750Available ? lightMeter.readLightLevel() : -1;
    
    // Print readings to Serial
    Serial.println("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    Serial.println("    🌡️  SENSOR READINGS");
    Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("❌ Failed to read from DHT sensor!");
      rgbLed.setPixelColor(0, rgbLed.Color(255, 0, 0));
      rgbLed.show();
    } else {
      Serial.print("  Temperature: "); Serial.print(temperature); Serial.println(" °C");
      Serial.print("  Rel Humidity: "); Serial.print(humidity); Serial.println(" %");
      float absoluteHumidity = calculateAbsoluteHumidity(temperature, humidity);
      Serial.print("  Abs Humidity: "); Serial.print(absoluteHumidity, 2); Serial.println(" g/m³");
      float dewPoint = calculateDewPoint(temperature, humidity);
      Serial.print("  Dew Point:   "); Serial.print(dewPoint); Serial.println(" °C");
    }
    
    Serial.print("  Soil Moisture: "); Serial.print(soilPercent); Serial.println(" %");

    if (lux >= 0) {
        Serial.print("  Light Level: "); Serial.print(lux); Serial.println(" lux");
    } else {
        Serial.println("  ❌ BH1750 sensor not available");
    }
    Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    // Send data to Firebase Realtime Database
    if (Firebase.ready() && signupOK && !isnan(temperature)) {
      if (currentMillis - lastFirebaseSend >= firebaseSendInterval) {
        lastFirebaseSend = currentMillis;
        
        Serial.println("📤 Sending data to Realtime Database...");
        
        // Path to push new environment data
        String path = "plants/" + String(PLANT_ID) + "/environment_data";
        
        FirebaseJson json;
        json.set("plantId", PLANT_ID);
        json.set("temperature", temperature);
        json.set("soilMoisture", soilPercent);
        json.set("relativeHumidity", humidity);
        json.set("absoluteHumidity", calculateAbsoluteHumidity(temperature, humidity));
        json.set("dewPoint", calculateDewPoint(temperature, humidity));
        if (lux >= 0) {
          json.set("lightLevel", lux);
        }
        json.set("timestamp/.sv", "timestamp"); // Server-side timestamp

        if (Firebase.RTDB.pushJSON(&fbdo, path.c_str(), &json)) {
            Serial.print("   ✓ RTDB push successful. Key: ");
            Serial.println(fbdo.pushName());
        } else {
            Serial.print("   ❌ RTDB push failed: ");
            Serial.println(fbdo.errorReason());
        }
      }
    }
  }
}
