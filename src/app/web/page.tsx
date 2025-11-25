"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlantDashboard } from "@/components/plant-dashboard";
import type { Plant } from "@/lib/types";
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
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, serverTimestamp } from "firebase/firestore";

export default function Web() {
  const firestore = useFirestore();
  const plantsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'plants') : null, [firestore]);
  const { data: plants, isLoading } = useCollection<Plant>(plantsCollection);

  const [selectedPlantId, setSelectedPlantId] = useState<string | undefined>(undefined);
  const [isAddPlantDialogOpen, setIsAddPlantDialogOpen] = useState(false);

  const selectedPlant = useMemo(() => {
    if (!plants || !selectedPlantId) return undefined;
    return plants.find((p) => p.id === selectedPlantId);
  }, [plants, selectedPlantId]);

  useState(() => {
    if (plants && plants.length > 0 && !selectedPlantId) {
      setSelectedPlantId(plants[0].id);
    }
  });

  const handleAddPlant = (newPlant: Omit<Plant, "id" | "datePlanted">) => {
    if (!plantsCollection) return;
    const plantWithTimestamp = { ...newPlant, datePlanted: serverTimestamp() };
    addDocumentNonBlocking(plantsCollection, plantWithTimestamp)
      .then((docRef) => {
        if (docRef) {
          setSelectedPlantId(docRef.id);
        }
      });
    setIsAddPlantDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-background min-h-screen p-4 font-body text-foreground">
        <Sprout className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-muted-foreground mt-4">Loading Plant Data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-background min-h-screen p-4 font-body text-foreground">
      <div className="w-full max-w-4xl mx-auto">
        <header className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sprout className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-headline font-bold text-primary">
              RuGrow Web
            </h1>
          </div>
          <p className="text-muted-foreground">Rextro 2025 Exhibition Demo</p>
        </header>

        <main className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
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
                  {plants?.map((plant) => (
                    <SelectItem key={plant.id} value={plant.id}>
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
            
            <div>
              <h2 className="text-xl font-bold text-primary mb-4">All Plants</h2>
              <div className="space-y-2">
                {plants?.map(plant => (
                  <div key={plant.id} className="p-2 border rounded-md cursor-pointer hover:bg-muted" onClick={() => setSelectedPlantId(plant.id)}>
                    {plant.name}
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div>
            {selectedPlant && <PlantDashboard plant={selectedPlant} />}
          </div>
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