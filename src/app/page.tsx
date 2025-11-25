"use client";

import { useState, useMemo } from "react";
import { PlantDashboard } from "@/components/plant-dashboard";
import type { Plant } from "@/lib/types";
import { Sprout } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function Home() {
  const firestore = useFirestore();
  const plantsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'plants') : null, [firestore]);
  const { data: plants, isLoading } = useCollection<Plant>(plantsCollection);

  const plant = useMemo(() => {
    if (!plants || plants.length === 0) return undefined;
    return plants[0];
  }, [plants]);


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
          {plant ? (
            <PlantDashboard plant={plant} />
          ) : (
             <div className="text-center p-8 border-dashed border-2 rounded-lg">
                <p className="text-muted-foreground">No plant data found.</p>
                <p className="text-sm text-muted-foreground mt-2">Please add a plant to your Firestore 'plants' collection.</p>
             </div>
          )}
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
