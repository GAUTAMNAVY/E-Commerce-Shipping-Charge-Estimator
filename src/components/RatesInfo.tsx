import { useQuery } from "@tanstack/react-query";
import { Plane, Truck, Car, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchShippingRates, fetchDeliverySpeeds } from "@/lib/api";

export function RatesInfo() {
  const { data: rates = [] } = useQuery({
    queryKey: ['shipping_rates'],
    queryFn: fetchShippingRates,
  });

  const { data: speeds = [] } = useQuery({
    queryKey: ['delivery_speeds'],
    queryFn: fetchDeliverySpeeds,
  });

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'Aeroplane': return <Plane className="w-5 h-5" />;
      case 'Truck': return <Truck className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  const getTransportColor = (mode: string) => {
    switch (mode) {
      case 'Aeroplane': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Truck': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Transport Modes & Rates
          </CardTitle>
          <CardDescription>
            Shipping rates vary by distance and transport type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rates.map((rate) => (
              <div
                key={rate.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${getTransportColor(rate.transport_mode)}`}
              >
                <div className="flex items-center gap-3">
                  {getTransportIcon(rate.transport_mode)}
                  <div>
                    <p className="font-medium">{rate.transport_mode}</p>
                    <p className="text-sm opacity-80">
                      {rate.max_distance_km 
                        ? `${rate.min_distance_km} - ${rate.max_distance_km} km`
                        : `${rate.min_distance_km}+ km`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{rate.rate_per_km_per_kg}</p>
                  <p className="text-xs opacity-80">per km/kg</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Delivery Speeds
          </CardTitle>
          <CardDescription>
            Choose delivery speed based on urgency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {speeds.map((speed) => (
              <div
                key={speed.id}
                className={`p-4 rounded-lg border ${
                  speed.speed_type === 'express' 
                    ? 'bg-amber-50 border-amber-200' 
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {speed.speed_type === 'express' ? (
                      <Zap className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium capitalize">{speed.speed_type}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{speed.description}</p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Base: </span>
                    <span className="font-medium">₹{speed.base_charge}</span>
                  </div>
                  {speed.extra_charge_per_kg > 0 && (
                    <div>
                      <span className="text-muted-foreground">Extra: </span>
                      <span className="font-medium">₹{speed.extra_charge_per_kg}/kg</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
