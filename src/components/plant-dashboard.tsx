"use client";

import type { Plant, EnvironmentData, WateringEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Thermometer, Droplets, Droplet, Wind, Cloud, Waves } from "lucide-react";
import { PepperIcon } from "@/components/icons/pepper-icon";
import { format } from "date-fns";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

type MetricCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number | undefined;
  unit?: string;
  loading?: boolean;
};

const MetricCard = ({ icon, title, value, unit, loading }: MetricCardProps) => (
  <Card className="bg-card/80 shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {loading ? (
         <div className="h-6 w-16 bg-muted-foreground/20 animate-pulse rounded-md" />
      ) : (
        <div className="text-2xl font-bold">
          {value ?? 'N/A'}
          {unit && value !== undefined && (
            <span className="text-xs font-normal text-muted-foreground ml-1">
              {unit}
            </span>
          )}
        </div>
      )}
    </CardContent>
  </Card>
);

export function PlantDashboard({ plant }: { plant: Plant }) {
  const { toast } = useToast();
  const firestore = useFirestore();

  const environmentDataQuery = useMemoFirebase(() => {
    if (!firestore || !plant.id) return null;
    return query(
      collection(firestore, `plants/${plant.id}/environment_data`),
      orderBy("timestamp", "desc"),
      limit(1)
    );
  }, [firestore, plant.id]);

  const wateringEventsQuery = useMemoFirebase(() => {
    if (!firestore || !plant.id) return null;
    return query(
      collection(firestore, `plants/${plant.id}/watering_events`),
      orderBy("timestamp", "desc"),
      limit(1)
    );
  }, [firestore, plant.id]);

  const { data: envData, isLoading: isEnvLoading } = useCollection<EnvironmentData>(environmentDataQuery);
  const { data: wateringEvents, isLoading: isWateringLoading } = useCollection<WateringEvent>(wateringEventsQuery);

  const latestEnvData = envData?.[0];
  const lastWateredEvent = wateringEvents?.[0];

  const handleWaterPlant = () => {
    if (!firestore) return;
    const wateringEventsCollection = collection(firestore, `plants/${plant.id}/watering_events`);
    addDocumentNonBlocking(wateringEventsCollection, {
      plantId: plant.id,
      timestamp: serverTimestamp(),
      waterAmount: 250 // Example amount in ml
    });

    toast({
      title: "Watering Plant",
      description: `A signal has been sent to water ${plant.name}.`,
    });
  };

  const lastHarvestedDate = new Date(); // Placeholder

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-3 grid-cols-2">
        <MetricCard
          title="Temperature"
          value={latestEnvData?.temperature}
          unit="°C"
          icon={<Thermometer className="h-4 w-4 text-muted-foreground" />}
          loading={isEnvLoading}
        />
        <MetricCard
          title="Soil Moisture"
          value={latestEnvData?.soilMoisture}
          unit="%"
          icon={<Droplets className="h-4 w-4 text-muted-foreground" />}
          loading={isEnvLoading}
        />
         <MetricCard
          title="Relative Humidity"
          value={latestEnvData?.relativeHumidity}
          unit="%"
          icon={<Wind className="h-4 w-4 text-muted-foreground" />}
          loading={isEnvLoading}
        />
        <MetricCard
          title="Absolute Humidity"
          value={latestEnvData?.absoluteHumidity}
          unit="g/m³"
          icon={<Cloud className="h-4 w-4 text-muted-foreground" />}
          loading={isEnvLoading}
        />
        <MetricCard
          title="Dew Point"
          value={latestEnvData?.dewPoint}
          unit="°C"
          icon={<Waves className="h-4 w-4 text-muted-foreground" />}
          loading={isEnvLoading}
        />
        <MetricCard
          title="Last Watered"
          value={lastWateredEvent?.timestamp ? format(lastWateredEvent.timestamp.toDate(), "MMM d, h:mm a") : "Never"}
          icon={<Droplet className="h-4 w-4 text-muted-foreground" />}
          loading={isWateringLoading}
        />
        <MetricCard
          title="Last Harvested"
          value={format(lastHarvestedDate, "MMM d, yyyy")}
          icon={<PepperIcon className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Manual Control</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manually activate the watering system for the selected plant.
          </p>
          <Button
            onClick={handleWaterPlant}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            disabled={!plant}
          >
            <Droplet className="mr-2 h-4 w-4" /> Water {plant.name}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}