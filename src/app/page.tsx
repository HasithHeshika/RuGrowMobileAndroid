"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlantDashboard } from "@/components/plant-dashboard";
import { plants } from "@/lib/data";
import { Sprout } from "lucide-react";

export default function Home() {
  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    plants[0].id.toString()
  );

  const selectedPlant = plants.find((p) => p.id.toString() === selectedPlantId);

  return (
    <div className="flex flex-col items-center bg-background min-h-screen p-4 font-body text-foreground">
      <div className="w-full max-w-md mx-auto">
        <header className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sprout className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-headline font-bold text-primary">
              RuGrow
            </h1>
          </div>
          <p className="text-muted-foreground">Rextro 2025 Exhibition Demo</p>
        </header>

        <main>
          <div className="mb-6">
            <label
              htmlFor="plant-select"
              className="block text-sm font-medium text-muted-foreground mb-2"
            >
              Select Plant
            </label>
            <Select
              onValueChange={setSelectedPlantId}
              defaultValue={selectedPlantId}
            >
              <SelectTrigger id="plant-select" className="w-full">
                <SelectValue placeholder="Select a plant..." />
              </SelectTrigger>
              <SelectContent>
                {plants.map((plant) => (
                  <SelectItem key={plant.id} value={plant.id.toString()}>
                    {plant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlant && <PlantDashboard plant={selectedPlant} />}
        </main>

        <footer className="text-center mt-10 text-xs text-muted-foreground">
          <p className="font-semibold">Faculty of Engineering, University of Ruhuna</p>
          <p>December 5, 6, 7 - 2025</p>
        </footer>
      </div>
    </div>
  );
}
