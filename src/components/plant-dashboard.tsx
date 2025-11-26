"use client";

import type { Plant, EnvironmentData, WateringEvent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Thermometer, Droplets, Droplet, Wind, Cloud, Waves, Sun } from "lucide-react";
import { PepperIcon } from "@/components/icons/pepper-icon";
import { format } from "date-fns";
import { useMemo } from "react";
import { getDatabase, ref, push, serverTimestamp } from "firebase/database";
import { useRtdbListData } from "@/firebase/rtdb/use-rtdb-list-data";
import { useFirebase } from "@/firebase";

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
          {unit && value !== undefined && value !== 'N/A' && (
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
  const { firebaseApp } = useFirebase();
  const db = useMemo(() => firebaseApp ? getDatabase(firebaseApp) : null, [firebaseApp]);

  const envDataPath = `plants/${plant.id}/environment_data`;
  const wateringEventsPath = `plants/${plant.id}/watering_events`;

  const { data: envData, isLoading: isEnvLoading } = useRtdbListData<EnvironmentData>(db, envDataPath, { limitToLast: 1 });
  const { data: wateringEvents, isLoading: isWateringLoading } = useRtdbListData<WateringEvent>(db, wateringEventsPath, { limitToLast: 1 });

  const latestEnvData = envData?.[0];
  const lastWateredEvent = wateringEvents?.[0];

  const handleWaterPlant = () => {
    if (!db || !plant.id) return;
    const wateringEventsRef = ref(db, `plants/${plant.id}/watering_events`);
    push(wateringEventsRef, {
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

  const formatTimestamp = (timestamp: number | undefined) => {
    if (!timestamp) return "Never";
    return format(new Date(timestamp), "MMM d, h:mm a");
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-3 grid-cols-2">
        <MetricCard
          title="Temperature"
          value={latestEnvData?.temperature?.toFixed(1)}
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
          title="Rel. Humidity"
          value={latestEnvData?.relativeHumidity?.toFixed(1)}
          unit="%"
          icon={<Wind className="h-4 w-4 text-muted-foreground" />}
          loading={isEnvLoading}
        />
        <MetricCard
          title="Abs. Humidity"
          value={latestEnvData?.absoluteHumidity?.toFixed(2)}
          unit="g/m³"
          icon={<Cloud className="h-4 w-4 text-muted-foreground" />}
          loading={isEnvLoading}
        />
        <MetricCard
          title="Dew Point"
          value={latestEnvData?.dewPoint?.toFixed(1)}
          unit="°C"
          icon={<Waves className="h-4 w-4 text-muted-foreground" />}
          loading={isEnvLoading}
        />
        <MetricCard
          title="Light Level"
          value={latestEnvData?.lightLevel}
          unit="lux"
          icon={<Sun className="h-4 w-4 text-muted-foreground" />}
          loading={isEnvLoading}
        />
        <MetricCard
          title="Last Watered"
          value={formatTimestamp(lastWateredEvent?.timestamp)}
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
