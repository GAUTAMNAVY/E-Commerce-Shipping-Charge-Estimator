import { Package, Truck } from "lucide-react";

export function Header() {
  return (
    <header className="gradient-hero text-primary-foreground">
      <div className="container py-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-foreground/10">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ShipCalc</h1>
            <p className="text-sm text-primary-foreground/70">B2B Shipping Estimator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
