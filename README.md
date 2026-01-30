# B2B E-Commerce Shipping Charge Estimator

A comprehensive shipping cost calculation platform for B2B e-commerce marketplaces serving Kirana stores. This application provides REST APIs to calculate shipping charges based on distance, transport mode, and delivery speed.

## Project Overview

This shipping estimator helps B2B e-commerce marketplace platforms (similar to Flipkart/Amazon but for Kirana stores) calculate accurate shipping costs when sellers deliver products to customer locations via warehouse hubs.

### Key Features

- **Multi-mode Transport**: Automatically selects optimal transport (Aeroplane, Truck, Mini Van) based on distance
- **Flexible Delivery Speeds**: Standard and Express delivery options with different pricing
- **Warehouse Optimization**: Finds nearest warehouse to seller for efficient logistics
- **Real-time Calculation**: Instant shipping cost estimation with detailed breakdowns
- **Caching Layer**: High-performance caching for frequent lookups
- **Design Patterns**: Built with Strategy, Singleton, and Service Layer patterns
- **Comprehensive Testing**: Full unit and integration test coverage

## Tech Stack

- **Frontend**: React + TypeScript + shadcn/ui + TailwindCSS
- **Backend**: Supabase Edge Functions (Deno/TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest
- **Build Tools**: Vite

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Supabase CLI (optional, for local development)
- Supabase account

### Installation

```bash
# Clone the repository
cd kirana-ship-buddy

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Running Locally

```bash
# Start the development server
npm run dev
# or
bun dev

# Run tests
npm test
# or
bun test
```

Visit `http://localhost:5173` to see the application.

## API Documentation

### Base URL

```
Development: http://localhost:54321/functions/v1
Production: https://your-project.supabase.co/functions/v1
```

### authentication

Currently uses Supabase anon key. For production, implement proper authentication.

### Endpoints

#### 1. GET /api/v1/warehouse/nearest

Find the nearest warehouse to a seller's location.

**Methods**: GET, POST

**Parameters**:
- `sellerId` (required): UUID of the seller
- `productId` (optional): UUID of the product

**Example Request (GET)**:
```bash
curl "https://your-project.supabase.co/functions/v1/nearest-warehouse?sellerId=660e8400-e29b-41d4-a716-446655440001"
```

**Example Request (POST)**:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/nearest-warehouse \
  -H "Content-Type: application/json" \
  -d '{"sellerId": "660e8400-e29b-41d4-a716-446655440001"}'
```

**Success Response (200)**:
```json
{
  "warehouseId": "770e8400-e29b-41d4-a716-446655440001",
  "warehouseLocation": {
    "lat": 12.99999,
    "long": 37.923273
  },
  "warehouseName": "BLR_Warehouse",
  "distance_km": 45.67
}
```

**Error Responses**:
- 400: Invalid or missing sellerId
- 404: Seller not found or no active warehouses
- 500: Internal server error

---

#### 2. GET /api/v1/shipping-charge

Calculate shipping charge from warehouse to customer.

**Methods**: GET, POST

**Parameters**:
- `warehouseId` (required): UUID of the warehouse
- `customerId` (required): UUID of the customer
- `deliverySpeed` (optional): "standard" or "express" (default: "standard")
- `productId` (optional): UUID of product for weight calculation

**Example Request (GET)**:
```bash
curl "https://your-project.supabase.co/functions/v1/shipping-charge?warehouseId=770e8400-e29b-41d4-a716-446655440001&customerId=550e8400-e29b-41d4-a716-446655440001&deliverySpeed=express"
```

**Success Response (200)**:
```json
{
  "shippingCharge": 1522.00,
  "transportMode": "Mini Van",
  "distance_km": 50.25,
  "weight_kg": 10,
  "breakdown": {
    "baseCharge": 10.00,
    "transportCharge": 1500.00,
    "expressCharge": 12.00
  }
}
```

**Error Responses**:
- 400: Invalid parameters or delivery speed
- 404: Warehouse, customer, or delivery config not found
- 500: Internal server error

---

#### 3. POST /api/v1/shipping-charge/calculate

Calculate complete shipping from seller to customer (combines endpoints 1 & 2).

**Method**: POST only

**Parameters**:
- `sellerId` (required): UUID of the seller
- `customerId` (required): UUID of the customer
- `deliverySpeed` (optional): "standard" or "express" (default: "standard")
- `productId` (optional): UUID of product

**Example Request**:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/calculate-shipping \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "660e8400-e29b-41d4-a716-446655440001",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "deliverySpeed": "express",
    "productId": "880e8400-e29b-41d4-a716-446655440001"
  }'
```

**Success Response (200)**:
```json
{
  "shippingCharge": 1522.00,
  "nearestWarehouse": {
    "warehouseId": "770e8400-e29b-41d4-a716-446655440001",
    "warehouseLocation": {
      "lat": 12.99999,
      "long": 37.923273
    },
    "warehouseName": "BLR_Warehouse"
  },
  "transportMode": "Mini Van",
  "distance_km": 50.25,
  "weight_kg": 0.5,
  "breakdown": {
    "baseCharge": 10.00,
    "transportCharge": 75.38,
    "expressCharge": 0.60
  }
}
```

**Error Responses**:
- 400: Invalid or missing parameters
- 404: Seller, customer, or warehouse not found
- 405: Method not allowed (only POST accepted)
- 500: Internal server error

## Transport Modes & Pricing

### Transport Selection (Distance-based)

| Transport Mode | Distance Range | Rate per km per kg |
|---------------|----------------|-------------------|
| Mini Van      | 0-100 km       | Rs 3.00           |
| Truck         | 100-500 km     | Rs 2.00           |
| Aeroplane     | 500+ km        | Rs 1.00           |

### Delivery Speeds

| Speed Type | Base Charge | Extra Charge | Total Formula |
|-----------|-------------|--------------|---------------|
| Standard  | Rs 10       | Rs 0         | Base + Transport |
| Express   | Rs 10       | Rs 1.2/kg    | Base + Transport + (1.2 × weight) |

### Calculation Formula

```
Total Shipping Charge = Base Charge + Transport Charge + Express Charge

Where:
- Base Charge = Rs 10 (both standard and express)
- Transport Charge = Distance (km) × Rate (per km per kg) × Weight (kg)
- Express Charge = Weight (kg) × Rs 1.2 (only for express delivery, 0 for standard)
```

## Design Patterns

This application implements several design patterns for maintainability and extensibility:

### 1. Strategy Pattern
Transport mode selection uses different strategies for Aeroplane, Truck, and Mini Van. Easy to add new transport modes.

**Location**: `supabase/functions/_shared/transport-strategy.ts`

### 2. Singleton Pattern
Cache manager ensures single instance across the application for optimal memory usage.

**Location**: `supabase/functions/_shared/cache-manager.ts`

### 3. Service Layer Pattern
Business logic is separated from API handlers for better testability and reusability.

**Location**: `supabase/functions/_shared/shipping-service.ts`

### 4. Validation Pattern
Centralized validation with clear error messages.

**Location**: `supabase/functions/_shared/validation.ts`

## Caching Strategy

The application uses in-memory caching for optimal performance:

- **Nearest Warehouse Lookups**: 5-minute TTL
- **Shipping Calculations**: 2-minute TTL
- **Cache Keys**: Structured as `{operation}:{entityId1}:{entityId2}...`

## Database Schema

View the complete schema in `supabase/migrations/`.

### Main Tables

- `customers`: Kirana store information with location
- `sellers`: Product distributors with location
- `products`: Product catalog with weight and dimensions
- `warehouses`: Distribution centers across India
- `shipping_rates`: Transport mode configurations
- `delivery_speeds`: Delivery speed pricing

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- unit              # Unit tests only
npm test -- integration       # Integration tests only

# Watch mode
npm test -- --watch
```

### Test Coverage

- ✅ Distance calculation utilities
- ✅ Transport strategy selection
- ✅ Shipping charge calculations
- ✅ Edge cases and validation
- ✅ Real-world product scenarios

## Development

### Project Structure

```
kirana-ship-buddy/
├── src/
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   ├── pages/               # Page components
│   └── test/                # Frontend tests
├── supabase/
│   ├── functions/           # Edge functions (APIs)
│   │   ├── _shared/         # Shared utilities
│   │   ├── nearest-warehouse/
│   │   ├── shipping-charge/
│   │   └── calculate-shipping/
│   └── migrations/          # Database migrations
└── docs/                    # Documentation
```

### Code Quality

- TypeScript strict mode enabled
- ESLint for code quality
- Vitest for testing
- Comprehensive JSDoc comments

## Deployment

### Supabase Deployment

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Deploy edge functions
npx supabase functions deploy nearest-warehouse
npx supabase functions deploy shipping-charge
npx supabase functions deploy calculate-shipping

# Apply migrations
npx supabase db push
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy the `dist` folder to Vercel, Netlify, or any static hosting service.

## Sample Data

The application includes seed data with:

- 8 Kirana stores across major Indian cities
- 3 sellers (Nestle, Rice, Sugar)
- 12 products (Maggie, Rice bags, Sugar bags, etc.)
- 4 warehouses (Bangalore, Mumbai, Delhi, Chennai)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - feel free to use this project for your applications.

## Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for Kirana stores across India**
