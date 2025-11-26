import { Timestamp } from "firebase/firestore";

export interface Plant {
  id: string;
  name: string;
  species: string;
  datePlanted: Timestamp;
}

export interface EnvironmentData {
  plantId: string;
  temperature: number;
  soilMoisture: number;
  relativeHumidity: number;
  absoluteHumidity: number;
  dewPoint: number;
  lightLevel?: number;
  timestamp: number; // RTDB timestamp is in milliseconds
}

export interface WateringEvent {
  plantId: string;
  timestamp: number; // RTDB timestamp is in milliseconds
  waterAmount: number;
}
