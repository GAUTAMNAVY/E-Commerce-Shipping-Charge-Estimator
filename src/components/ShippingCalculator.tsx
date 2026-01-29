import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calculator, Package, MapPin, Truck, Plane, Car, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetchSellers, fetchCustomers, fetchProducts, calculateShipping } from "@/lib/api";
import type { DeliverySpeedType, CalculateShippingResponse } from "@/lib/types";

export function ShippingCalculator() {
  const [sellerId, setSellerId] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeedType>("standard");
  const [result, setResult] = useState<CalculateShippingResponse | null>(null);

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: fetchSellers,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const calculateMutation = useMutation({
    mutationFn: () => calculateShipping(sellerId, customerId, deliverySpeed, productId || undefined),
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const filteredProducts = products.filter(p => !sellerId || p.seller_id === sellerId);

  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'Aeroplane': return <Plane className="w-5 h-5" />;
      case 'Truck': return <Truck className="w-5 h-5" />;
      default: return <Car className="w-5 h-5" />;
    }
  };

  const getTransportClass = (mode: string) => {
    switch (mode) {
      case 'Aeroplane': return 'transport-aeroplane';
      case 'Truck': return 'transport-truck';
      default: return 'transport-minivan';
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Calculate Shipping
          </CardTitle>
          <CardDescription>
            Estimate shipping costs from seller to customer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Seller</Label>
            <Select value={sellerId} onValueChange={(val) => {
              setSellerId(val);
              setProductId("");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a seller" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((seller) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.name} ({seller.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product (optional)</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product for weight calculation" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.weight_kg}kg) - ₹{product.selling_price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Customer (Kirana Store)</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Delivery Speed</Label>
            <RadioGroup
              value={deliverySpeed}
              onValueChange={(val) => setDeliverySpeed(val as DeliverySpeedType)}
              className="grid grid-cols-2 gap-3"
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard" className="cursor-pointer flex-1">
                  <div className="font-medium">Standard</div>
                  <div className="text-xs text-muted-foreground">3-5 business days</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="express" id="express" />
                <Label htmlFor="express" className="cursor-pointer flex-1">
                  <div className="font-medium">Express</div>
                  <div className="text-xs text-muted-foreground">1-2 business days</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            className="w-full"
            onClick={() => calculateMutation.mutate()}
            disabled={!sellerId || !customerId || calculateMutation.isPending}
          >
            {calculateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Shipping Charge
              </>
            )}
          </Button>

          {calculateMutation.isError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              Error: {(calculateMutation.error as Error)?.message || 'Failed to calculate'}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Shipping Result
          </CardTitle>
          <CardDescription>
            Detailed breakdown of shipping costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                <p className="text-sm text-muted-foreground mb-1">Total Shipping Charge</p>
                <p className="text-4xl font-bold text-foreground">₹{result.shippingCharge.toFixed(2)}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Nearest Warehouse</span>
                  </div>
                  <span className="font-medium">{result.nearestWarehouse.warehouseName}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {getTransportIcon(result.transportMode)}
                    <span className="text-sm">Transport Mode</span>
                  </div>
                  <span className={getTransportClass(result.transportMode)}>
                    {result.transportMode}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Distance</span>
                  <span className="font-medium">{result.distance_km} km</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Weight</span>
                  <span className="font-medium">{result.weight_kg} kg</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-3">Cost Breakdown</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Courier Charge</span>
                    <span>₹{result.breakdown.baseCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Transport Charge</span>
                    <span>₹{result.breakdown.transportCharge.toFixed(2)}</span>
                  </div>
                  {result.breakdown.expressCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Express Surcharge</span>
                      <span>₹{result.breakdown.expressCharge.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Select options and calculate to see results
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
