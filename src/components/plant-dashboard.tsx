"use client";

import type { Plant } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Thermometer, Droplets, Droplet } from "lucide-react";
import { PepperIcon } from "@/components/icons/pepper-icon";
import { format } from "date-fns";

type MetricCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  unit?: string;
};

const MetricCard = ({ icon, title, value, unit }: MetricCardProps) => (
  <Card className="bg-card/80 shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value}
        {unit && (
          <span className="text-xs font-normal text-muted-foreground ml-1">
            {unit}
          </span>
        )}
      </div>
    </CardContent>
  </Card>
);

export function PlantDashboard({ plant }: { plant: Plant }) {
  const { toast } = useToast();

  const handleWaterPlant = () => {
    toast({
      title: "Watering Plant",
      description: `A signal has been sent to water ${plant.name}.`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 grid-cols-2">
        <MetricCard
          title="Temperature"
          value={plant.temperature}
          unit="°C"
          icon={<Thermometer className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Soil Moisture"
          value={plant.soilMoisture}
          unit="%"
          icon={<Droplets className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Last Watered"
          value={format(plant.lastWatered, "MMM d, h:mm a")}
          icon={<Droplet className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Last Harvested"
          value={format(plant.lastHarvested, "MMM d, yyyy")}
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
          >
            <Droplet className="mr-2 h-4 w-4" /> Water {plant.name}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
