-- Seed data for B2B E-Commerce Shipping Estimator
-- This migration adds sample data matching the problem statement

-- Insert sample customers (Kirana stores)
INSERT INTO public.customers (id, name, phone_number, latitude, longitude, address, city) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Shree Kirana Store', '9847123456', 11.232, 23.445495, 'Shop No. 12, MG Road', 'Mumbai'),
('550e8400-e29b-41d4-a716-446655440002', 'Andheri Mini Mart', '9101234567', 17.232, 33.445495, '45 Station Road, Andheri West', 'Mumbai'),
('550e8400-e29b-41d4-a716-446655440003', 'Delhi General Store', '9876543210', 28.6139, 77.2090, 'Block C, Connaught Place', 'Delhi'),
('550e8400-e29b-41d4-a716-446655440004', 'Bangalore Provisions', '9845123456', 12.9716, 77.5946, 'Indiranagar Main Road', 'Bangalore');

-- Insert sample sellers
INSERT INTO public.sellers (id, name, phone_number, latitude, longitude, address, city) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Nestle Seller', '9900112233', 19.0760, 72.8777, 'Nestle India Ltd, Turbhe', 'Mumbai'),
('660e8400-e29b-41d4-a716-446655440002', 'Rice Seller', '9988776655', 13.0827, 80.2707, 'Rice Warehouse, Guindy', 'Chennai'),
('660e8400-e29b-41d4-a716-446655440003', 'Sugar Seller', '9123456789', 22.5726, 88.3639, 'Sugar Mills Road', 'Kolkata');

-- Insert warehouses matching problem statement
INSERT INTO public.warehouses (id, name, latitude, longitude, address, city, capacity_kg, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'BLR_Warehouse', 12.99999, 37.923273, 'Electronic City Phase 1', 'Bangalore', 500000, true),
('770e8400-e29b-41d4-a716-446655440002', 'MUMB_Warehouse', 11.99999, 27.923273, 'Bhiwandi Industrial area', 'Mumbai', 750000, true),
('770e8400-e29b-41d4-a716-446655440003', 'DEL_Warehouse', 28.7041, 77.1025, 'Gurgaon Logistics Hub', 'Delhi', 600000, true),
('770e8400-e29b-41d4-a716-446655440004', 'CHN_Warehouse', 13.0827, 80.2707, 'Guindy Industrial Estate', 'Chennai', 400000, true);

-- Insert products matching problem statement with realistic attributes
INSERT INTO public.products (id, seller_id, name, selling_price, weight_kg, dimension_length_cm, dimension_width_cm, dimension_height_cm, description, category) VALUES
-- Nestle products
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Maggie 500g Packet', 10.00, 0.5, 10, 10, 10, 'Instant noodles masala flavor', 'Packaged Food'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Nescafe Coffee 100g', 125.00, 0.1, 8, 8, 12, 'Premium instant coffee', 'Beverages'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'KitKat Chocolate Box 24pcs', 240.00, 0.65, 20, 15, 8, 'Milk chocolate wafer bars', 'Confectionery'),

-- Rice products
('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'Rice Bag 10Kg', 500.00, 10, 1000, 800, 500, 'Premium Basmati Rice', 'Grains'),
('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Rice Bag 25Kg', 1200.00, 25, 1200, 1000, 600, 'Bulk Basmati Rice', 'Grains'),
('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Rice Bag 5Kg', 250.00, 5, 600, 400, 300, 'Regular Rice', 'Grains'),

-- Sugar products
('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', 'Sugar Bag 25kg', 700.00, 25, 1000, 900, 600, 'Refined White Sugar', 'Sweeteners'),
('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 'Sugar Bag 10kg', 300.00, 10, 800, 600, 400, 'Refined White Sugar', 'Sweeteners'),
('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003', 'Sugar Bag 1kg', 35.00, 1, 200, 150, 100, 'Packet Sugar', 'Sweeteners');

-- Insert shipping rates matching problem statement exactly
INSERT INTO public.shipping_rates (id, transport_mode, min_distance_km, max_distance_km, rate_per_km_per_kg, description) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Mini Van', 0, 99.99, 3.0, 'Short distance delivery 0-100km'),
('990e8400-e29b-41d4-a716-446655440002', 'Truck', 100, 499.99, 2.0, 'Medium distance delivery 100-500km'),
('990e8400-e29b-41d4-a716-446655440003', 'Aeroplane', 500, NULL, 1.0, 'Long distance delivery 500km+');

-- Insert delivery speed configurations matching problem statement
INSERT INTO public.delivery_speeds (id, speed_type, base_charge, extra_charge_per_kg, description) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'standard', 10.00, 0.00, 'Standard delivery: Rs 10 base charge + calculated shipping'),
('aa0e8400-e29b-41d4-a716-446655440002', 'express', 10.00, 1.20, 'Express delivery: Rs 10 base charge + Rs 1.2 per kg extra + calculated shipping');

-- Add some additional realistic data for better testing

-- More customers in different cities
INSERT INTO public.customers (id, name, phone_number, latitude, longitude, address, city) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'Kolkata Kirana', '9123456789', 22.5726, 88.3639, 'Park Street', 'Kolkata'),
('550e8400-e29b-41d4-a716-446655440006', 'Hyderabad Supermart', '9876543210', 17.3850, 78.4867, 'Banjara Hills', 'Hyderabad'),
('550e8400-e29b-41d4-a716-446655440007', 'Pune General Store', '9988112233', 18.5204, 73.8567, 'FC Road', 'Pune'),
('550e8400-e29b-41d4-a716-446655440008', 'Chennai Corner Shop', '9845678901', 13.0827, 80.2707, 'T Nagar', 'Chennai');

-- Additional products for variety
INSERT INTO public.products (id, seller_id, name, selling_price, weight_kg, dimension_length_cm, dimension_width_cm, dimension_height_cm, description, category) VALUES
('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440001', 'Maggie Carton (12 packets)', 115.00, 6, 30, 20, 15, 'Bulk pack instant noodles', 'Packaged Food'),
('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'Rice Premium 50Kg', 2400.00, 50, 1500, 1000, 700, 'Bulk Premium Basmati', 'Grains'),
('880e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440003', 'Sugar Bulk 50kg', 1350.00, 50, 1200, 1000, 700, 'Industrial Sugar', 'Sweeteners');
