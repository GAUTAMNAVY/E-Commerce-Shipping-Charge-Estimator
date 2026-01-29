import { useQuery } from "@tanstack/react-query";
import { Users, Store, Package, Warehouse } from "lucide-react";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { ShippingCalculator } from "@/components/ShippingCalculator";
import { EntityTabs } from "@/components/EntityTabs";
import { RatesInfo } from "@/components/RatesInfo";
import { fetchCustomers, fetchSellers, fetchProducts, fetchWarehouses } from "@/lib/api";

const Index = () => {
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: fetchSellers,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 space-y-8">
        {/* Stats Overview */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          <StatsCard
            title="Kirana Stores"
            value={customers.length}
            icon={Users}
            description="Registered customers"
          />
          <StatsCard
            title="Sellers"
            value={sellers.length}
            icon={Store}
            description="Active distributors"
          />
          <StatsCard
            title="Products"
            value={products.length}
            icon={Package}
            description="In catalog"
          />
          <StatsCard
            title="Warehouses"
            value={warehouses.filter(w => w.is_active).length}
            icon={Warehouse}
            description="Active locations"
          />
        </section>

        {/* Shipping Calculator */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Shipping Calculator</h2>
          <ShippingCalculator />
        </section>

        {/* Rates Information */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Rates & Pricing</h2>
          <RatesInfo />
        </section>

        {/* Entity Browser */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Data Explorer</h2>
          <EntityTabs />
        </section>
      </main>

      <footer className="border-t border-border py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>B2B E-Commerce Shipping Estimator • Built for Kirana Store Marketplace</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
