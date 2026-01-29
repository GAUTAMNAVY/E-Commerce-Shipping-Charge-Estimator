import { useQuery } from "@tanstack/react-query";
import { Users, Store, Package, Warehouse, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchCustomers, fetchSellers, fetchProducts, fetchWarehouses } from "@/lib/api";

export function EntityTabs() {
  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const { data: sellers = [], isLoading: loadingSellers } = useQuery({
    queryKey: ['sellers'],
    queryFn: fetchSellers,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: warehouses = [], isLoading: loadingWarehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
  });

  const LoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <Tabs defaultValue="customers" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
        <TabsTrigger value="customers" className="gap-2">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Customers</span>
        </TabsTrigger>
        <TabsTrigger value="sellers" className="gap-2">
          <Store className="w-4 h-4" />
          <span className="hidden sm:inline">Sellers</span>
        </TabsTrigger>
        <TabsTrigger value="products" className="gap-2">
          <Package className="w-4 h-4" />
          <span className="hidden sm:inline">Products</span>
        </TabsTrigger>
        <TabsTrigger value="warehouses" className="gap-2">
          <Warehouse className="w-4 h-4" />
          <span className="hidden sm:inline">Warehouses</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="customers">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Kirana Store Customers</CardTitle>
            <CardDescription>Registered retail stores in the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCustomers ? <LoadingState /> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="font-mono text-sm">{customer.phone_number}</TableCell>
                        <TableCell>{customer.city || '-'}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {customer.latitude.toFixed(4)}, {customer.longitude.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sellers">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Product Sellers</CardTitle>
            <CardDescription>Distributors and wholesalers</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSellers ? <LoadingState /> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sellers.map((seller) => (
                      <TableRow key={seller.id}>
                        <TableCell className="font-medium">{seller.name}</TableCell>
                        <TableCell className="font-mono text-sm">{seller.phone_number || '-'}</TableCell>
                        <TableCell>{seller.city || '-'}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {seller.latitude.toFixed(4)}, {seller.longitude.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="products">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Products Catalog</CardTitle>
            <CardDescription>Available products from sellers</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProducts ? <LoadingState /> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead>Dimensions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.seller?.name || '-'}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs rounded-full bg-muted">
                            {product.category || 'General'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">₹{product.selling_price}</TableCell>
                        <TableCell className="text-right">{product.weight_kg} kg</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {product.dimension_length_cm}×{product.dimension_width_cm}×{product.dimension_height_cm} cm
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="warehouses">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Warehouse Network</CardTitle>
            <CardDescription>Distribution centers across India</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingWarehouses ? <LoadingState /> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Capacity</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouses.map((warehouse) => (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">{warehouse.name}</TableCell>
                        <TableCell>{warehouse.city || '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            warehouse.is_active 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {warehouse.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {warehouse.capacity_kg ? `${(warehouse.capacity_kg / 1000).toFixed(0)}T` : '-'}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {warehouse.latitude.toFixed(4)}, {warehouse.longitude.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
