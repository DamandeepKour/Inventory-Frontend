# Frontend—Inventory Management UI

React + Vite + Tailwind CSS admin console for managing products, customers, and orders.

## Project structure

src/
├── App.jsx                 # BrowserRouter + providers
├── routes/AppRoutes.jsx    # Route definitions
├── layouts/
│   └── ApplicationLayout.jsx  # Sidebar + <Outlet />
├── pages/
│   ├── Dashboard/
│   ├── Products/
│   ├── Customers/
│   └── Orders/
├── components/ui/          # Shared UI (Modal, FloatingInput, etc.)
├── context/RefreshContext.jsx
└── api/client.js

## Routes

 Path - Page 
| `/` | Redirects to `/dashboard` |
| `/dashboard` | Dashboard stats |
| `/products` | Product management |
| `/customers` | Customer management |
| `/orders` | Order management |

## Run locally


npm install
npm run dev


Set `VITE_API_URL=http://localhost:8000` in `.env`

## Docker

Built as part of the root compose stack:

```bash
cd ..
docker compose up --build
```

Frontend: http://localhost:3000

