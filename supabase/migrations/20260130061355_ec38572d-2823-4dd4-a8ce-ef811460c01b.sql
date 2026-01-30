-- Remove overly permissive write policies from customers table
DROP POLICY IF EXISTS "Allow public delete on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public update on customers" ON public.customers;

-- Remove overly permissive write policies from sellers table
DROP POLICY IF EXISTS "Allow public delete on sellers" ON public.sellers;
DROP POLICY IF EXISTS "Allow public insert on sellers" ON public.sellers;
DROP POLICY IF EXISTS "Allow public update on sellers" ON public.sellers;

-- Remove overly permissive write policies from products table
DROP POLICY IF EXISTS "Allow public delete on products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert on products" ON public.products;
DROP POLICY IF EXISTS "Allow public update on products" ON public.products;

-- Remove overly permissive write policies from warehouses table
DROP POLICY IF EXISTS "Allow public delete on warehouses" ON public.warehouses;
DROP POLICY IF EXISTS "Allow public insert on warehouses" ON public.warehouses;
DROP POLICY IF EXISTS "Allow public update on warehouses" ON public.warehouses;

-- Keep the SELECT policies for marketplace directory browsing
-- The existing "Allow public read access on X" policies remain in place