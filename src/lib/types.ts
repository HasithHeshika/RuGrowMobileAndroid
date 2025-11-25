import { Timestamp } from "firebase/firestore";

export interface Plant {
  id: string;
  name: string;
  species: string;
  datePlanted: Timestamp;
}

export interface EnvironmentData {
  id: string;
  plantId: string;
  temperature: number;
  soilMoisture: number;
  relativeHumidity?: number;
  absoluteHumidity?: number;
  dewPoint?: number;
  timestamp: Timestamp;
}

export interface WateringEvent {
  id: string;
  plantId: string;
  timestamp: Timestamp;
  waterAmount: number;
}
