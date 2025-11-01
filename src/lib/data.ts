export interface Plant {
  id: number;
  name: string;
  temperature: number;
  soilMoisture: number;
  lastWatered: Date;
  lastHarvested: Date;
}

export const plants: Plant[] = [
  {
    id: 1,
    name: "Pepper Plant #1",
    temperature: 24,
    soilMoisture: 68,
    lastWatered: new Date("2025-12-04T08:00:00"),
    lastHarvested: new Date("2025-11-20T14:30:00"),
  },
  {
    id: 2,
    name: "Pepper Plant #2",
    temperature: 25,
    soilMoisture: 72,
    lastWatered: new Date("2025-12-04T08:05:00"),
    lastHarvested: new Date("2025-11-21T11:00:00"),
  },
  {
    id: 3,
    name: "Pepper Plant #3",
    temperature: 23,
    soilMoisture: 65,
    lastWatered: new Date("2025-12-03T19:00:00"),
    lastHarvested: new Date("2025-11-19T16:00:00"),
  },
  {
    id: 10,
    name: "Pepper Plant #10",
    temperature: 24,
    soilMoisture: 70,
    lastWatered: new Date("2025-12-04T09:00:00"),
    lastHarvested: new Date("2025-11-25T10:00:00"),
  },
];
