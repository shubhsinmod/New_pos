# Restaurant POS - Multi Outlet Starter

Starter scaffold for a multi-outlet restaurant POS.

## Stack
- Frontend: React + Vite
- Backend: Java 17+, Spring Boot 3, Spring Web, Spring Data JPA, Validation
- Database: Microsoft SQL Server (MSSQL)
- Initial focus: Restaurant/Outlet setup and architecture scaffold

## Important
This is a starter project, not a production-ready POS. Authentication/JWT, role enforcement,
customer/order/billing CRUD APIs, tests, and deployment configuration are intentionally marked
as next implementation steps. Do not expose this starter publicly without implementing security.

## Run frontend
```bash
cd frontend
npm install
npm run dev
```
Open the URL printed by Vite.

## Run backend
1. Create a database named `restaurant_pos` in Microsoft SQL Server (if not already present).
2. Set environment variables (or configure `application.properties`):
   - `DB_URL=jdbc:sqlserver://localhost:1433;databaseName=restaurant_pos;encrypt=true;trustServerCertificate=true`
   - `DB_USERNAME=sa`
   - `DB_PASSWORD=your_password`
3. Run:
```bash
cd backend
mvn spring-boot:run
```
On Windows:
```bat
mvn.cmd spring-boot:run
```

## API
- `GET /api/health`
- `GET /api/outlets`
- `POST /api/outlets`

Example POST:
```json
{
  "name": "Bengaluru Main",
  "code": "BLR-01",
  "phone": "9876543210",
  "email": "blr@example.com",
  "address": "Bengaluru, Karnataka",
  "gstin": null
}
```

## Architecture
React UI -> REST API -> Controller -> Service -> Repository -> MSSQL

Outlet-scoped records should carry `outlet_id` where applicable. The backend must validate the authenticated
user's outlet permissions; never trust a client-supplied `outlet_id` by itself.

## Next build order
1. Finish outlet CRUD + validation and database migrations.
2. Add restaurants and user-to-outlet assignments.
3. Add Spring Security/JWT and roles.
4. Add customers.
5. Add menu/categories/products and outlet-specific product availability/pricing.
6. Add orders/order items.
7. Add bills/payments and cancelled-bill regeneration rules.
