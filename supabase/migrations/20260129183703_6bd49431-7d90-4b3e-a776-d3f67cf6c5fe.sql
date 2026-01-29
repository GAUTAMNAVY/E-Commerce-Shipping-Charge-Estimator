-- Create customers table (Kirana stores)
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sellers table
CREATE TABLE public.sellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  weight_kg DECIMAL(10,3) NOT NULL,
  dimension_length_cm DECIMAL(10,2) NOT NULL,
  dimension_width_cm DECIMAL(10,2) NOT NULL,
  dimension_height_cm DECIMAL(10,2) NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warehouses table
CREATE TABLE public.warehouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  city TEXT,
  capacity_kg DECIMAL(15,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipping_rates table for flexible rate configuration
CREATE TABLE public.shipping_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transport_mode TEXT NOT NULL,
  min_distance_km DECIMAL(10,2) NOT NULL,
  max_distance_km DECIMAL(10,2),
  rate_per_km_per_kg DECIMAL(10,4) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_speeds table
CREATE TABLE public.delivery_speeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  speed_type TEXT NOT NULL UNIQUE,
  base_charge DECIMAL(10,2) NOT NULL,
  extra_charge_per_kg DECIMAL(10,4) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (public read access for this demo)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_speeds ENABLE ROW LEVEL SECURITY;

-- Create public read policies for all tables
CREATE POLICY "Allow public read access on customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public read access on sellers" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read access on warehouses" ON public.warehouses FOR SELECT USING (true);
CREATE POLICY "Allow public read access on shipping_rates" ON public.shipping_rates FOR SELECT USING (true);
CREATE POLICY "Allow public read access on delivery_speeds" ON public.delivery_speeds FOR SELECT USING (true);

-- Create public insert/update/delete policies for demo purposes
CREATE POLICY "Allow public insert on customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on sellers" ON public.sellers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on warehouses" ON public.warehouses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Allow public update on sellers" ON public.sellers FOR UPDATE USING (true);
CREATE POLICY "Allow public update on products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public update on warehouses" ON public.warehouses FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on customers" ON public.customers FOR DELETE USING (true);
CREATE POLICY "Allow public delete on sellers" ON public.sellers FOR DELETE USING (true);
CREATE POLICY "Allow public delete on products" ON public.products FOR DELETE USING (true);
CREATE POLICY "Allow public delete on warehouses" ON public.warehouses FOR DELETE USING (true);