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
import type { Plant } from "@/lib/data";
import { initialPlants } from "@/lib/data";
import { Sprout, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddPlantForm } from "@/components/add-plant-form";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [plants, setPlants] = useState<Plant[]>(initialPlants);
  const [selectedPlantId, setSelectedPlantId] = useState<string>(
    plants[0].id.toString()
  );
  const [isAddPlantDialogOpen, setIsAddPlantDialogOpen] = useState(false);

  const selectedPlant = plants.find((p) => p.id.toString() === selectedPlantId);

  const handleAddPlant = (newPlant: Omit<Plant, "id">) => {
    const newId = Math.max(...plants.map((p) => p.id)) + 1;
    const plantWithId = { ...newPlant, id: newId };
    setPlants((prevPlants) => [...prevPlants, plantWithId]);
    setSelectedPlantId(plantWithId.id.toString());
    setIsAddPlantDialogOpen(false);
  };

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
          <div className="mb-6 space-y-4">
            <div>
              <label
                htmlFor="plant-select"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                Select Plant
              </label>
              <Select
                onValueChange={setSelectedPlantId}
                value={selectedPlantId}
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

            <Dialog
              open={isAddPlantDialogOpen}
              onOpenChange={setIsAddPlantDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Plant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add a New Plant</DialogTitle>
                </DialogHeader>
                <AddPlantForm
                  onFormSubmit={handleAddPlant}
                  onCancel={() => setIsAddPlantDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {selectedPlant && <PlantDashboard plant={selectedPlant} />}
        </main>

        <footer className="text-center mt-10 text-xs text-muted-foreground">
          <p className="font-semibold">
            Faculty of Engineering, University of Ruhuna
          </p>
          <p>December 5, 6, 7 - 2025</p>
        </footer>
      </div>
    </div>
  );
}