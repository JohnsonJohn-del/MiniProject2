# API Reference

Base URL (local): `http://localhost:5000/api`

## Authentication

- Auth type: `Bearer <JWT_TOKEN>`
- Header: `Authorization: Bearer <token>`
- Roles: `admin`, `client`

## Response Envelope

Most endpoints return:

```json
{
  "success": true,
  "...": "payload"
}
```

Errors return:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Health

### `GET /health`
- Auth: No
- Role: Public
- Purpose: API status check

---

## Auth

### `POST /auth/register`
- Auth: No
- Role: Public
- Body:

```json
{
  "name": "Client Name",
  "email": "client@example.com",
  "password": "StrongPass123"
}
```

### `POST /auth/login`
- Auth: No
- Role: Public
- Body:

```json
{
  "email": "client@example.com",
  "password": "StrongPass123"
}
```

### `GET /auth/me`
- Auth: Yes
- Role: Any authenticated user

---

## Vendors

### `GET /vendors`
- Auth: Yes
- Role: Admin/Client

### `POST /vendors`
- Auth: Yes
- Role: Admin/Client
- Body:

```json
{
  "vendor_name": "Fresh Farms",
  "contact": "+91-9999999999"
}
```

### `PUT /vendors/:id`
- Auth: Yes
- Role: Admin/Owner client

### `DELETE /vendors/:id`
- Auth: Yes
- Role: Admin/Owner client

---

## Ingredients

### `GET /ingredients`
- Auth: Yes
- Role: Admin/Client

### `POST /ingredients`
- Auth: Yes
- Role: Admin/Client
- Body:

```json
{
  "ingredient_name": "Chicken Breast",
  "unit": "kg",
  "vendor_id": "<uuid-or-null>",
  "price_per_unit": 8.5
}
```

### `PUT /ingredients/:id`
- Auth: Yes
- Role: Admin/Owner client

### `DELETE /ingredients/:id`
- Auth: Yes
- Role: Admin/Owner client

---

## Recipes

### `GET /recipes`
- Auth: Yes
- Role: Admin/Client

### `GET /recipes/:id`
- Auth: Yes
- Role: Admin/Owner client

### `POST /recipes`
- Auth: Yes
- Role: Admin/Client
- Plan gating: recipe limit enforced for clients
- Body:

```json
{
  "recipe_name": "Chicken Alfredo",
  "items": [
    { "ingredient_id": "<uuid>", "quantity": 0.35 },
    { "ingredient_id": "<uuid>", "quantity": 0.08 }
  ]
}
```

### `PUT /recipes/:id`
- Auth: Yes
- Role: Admin/Owner client

### `DELETE /recipes/:id`
- Auth: Yes
- Role: Admin/Owner client

---

## Operational Expenses

> Requires feature access: `operationalCosting` (Pro/Premium for clients)

### `GET /operational-expenses`
- Auth: Yes
- Role: Admin/Client with plan access

### `POST /operational-expenses`
- Auth: Yes
- Role: Admin/Client with plan access
- Body:

```json
{
  "month": "2026-05",
  "electricity_bill": 430,
  "gas_bill": 290,
  "salary_cost": 2200
}
```

### `DELETE /operational-expenses/:id`
- Auth: Yes
- Role: Admin/Owner client

---

## Menu Items

> Requires feature access: `operationalCosting` (Pro/Premium for clients)

### `GET /menu-items`
- Auth: Yes
- Role: Admin/Client with plan access

### `POST /menu-items`
- Auth: Yes
- Role: Admin/Client with plan access
- Body:

```json
{
  "recipe_id": "<uuid>",
  "selling_price": 15.9
}
```

### `PUT /menu-items/:id`
- Auth: Yes
- Role: Admin/Owner client

### `DELETE /menu-items/:id`
- Auth: Yes
- Role: Admin/Owner client

---

## Costing

> Requires feature access: `operationalCosting` (Pro/Premium for clients)

### `GET /costing/recipes/:recipeId?month=YYYY-MM`
- Auth: Yes
- Role: Admin/Owner client
- Returns ingredient cost + operational allocation + salary allocation + final dish cost

---

## Subscription

### `GET /subscription/me`
- Auth: Yes
- Role: Admin/Client
- Returns plan limits, usage, and feature matrix

---

## AI

### `POST /ai/pricing-advice`
- Auth: Yes
- Role: Admin/Client
- Plan gating: requires `aiPricingSuggestions`
- Quota gating: daily AI request limit enforced for clients
- Body:

```json
{
  "recipe_id": "<uuid>",
  "current_price": 14.5,
  "month": "2026-05"
}
```

### `GET /ai/usage`
- Auth: Yes
- Role: Admin/Client
- Returns recent AI usage logs for current user

---

## Analytics

### `GET /analytics/client`
- Auth: Yes
- Role: Client/Admin
- Returns KPI overview + profitability lists
- Premium clients receive full ingredient impact and richer AI report summaries

---

## Admin (Admin role only)

### `GET /admin/overview`
- Auth: Yes
- Role: Admin

### `GET /admin/users?search=&plan=&status=`
- Auth: Yes
- Role: Admin

### `PATCH /admin/users/:userId/plan`
- Auth: Yes
- Role: Admin
- Body:

```json
{
  "subscription_plan": "pro"
}
```

### `PATCH /admin/users/:userId/active`
- Auth: Yes
- Role: Admin
- Body:

```json
{
  "is_active": true
}
```

### `POST /admin/users/:userId/reset-ai`
- Auth: Yes
- Role: Admin

### `GET /admin/ai-usage`
- Auth: Yes
- Role: Admin

### `GET /admin/records/:entity`
- Auth: Yes
- Role: Admin
- Supported entities:
  - `recipes`
  - `ingredients`
  - `menu_items`
  - `operational_expenses`
