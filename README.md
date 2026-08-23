# BlackPearl - Tours & Travel Agency

A full-stack tours and travel agency web application built with React, Cloudflare Workers, and Supabase.

## Features

- **Google OAuth Authentication** - Secure sign-in with Google
- **Tour Deals** - Browse and book curated tour packages
- **Build Your Own Package** - Custom trip builder with cascading forms
- **User Profile** - Editable profile with Pearls loyalty system
- **Admin Panel** - Full dashboard for managing all data
- **PDF Invoice Generation** - Client-side invoice generation on booking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18+ with Vite, Tailwind CSS, shadcn/ui |
| State | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |
| PDF | jsPDF + jspdf-autotable |
| API | Cloudflare Workers + Hono |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (Google OAuth) |

## Project Structure

```
blackpearl/
├── web/                    # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilities
│   │   ├── pages/          # Page components
│   │   └── stores/         # Zustand stores
│   └── package.json
├── worker/                 # Cloudflare Worker API
│   ├── src/
│   │   ├── middleware/      # Auth, CORS
│   │   ├── routes/         # API routes
│   │   └── lib/            # Utilities
│   └── package.json
├── supabase/
│   └── migrations/         # SQL migrations
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Cloudflare account

### 1. Database Setup

1. Create a new Supabase project
2. Go to SQL Editor in Supabase dashboard
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
4. Enable Google OAuth in Authentication → Providers
5. Set Site URL and Redirect URLs

### 2. Worker Setup

```bash
cd worker
npm install
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your Supabase credentials
npm run dev
```

### 3. Frontend Setup

```bash
cd web
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 4. Environment Variables

#### Frontend (.env)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8787
```

#### Worker (.dev.vars)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Deployment

### Frontend (Cloudflare Pages)

1. Push code to GitHub
2. Connect to Cloudflare Pages
3. Set build command: `cd web && npm install && npm run build`
4. Set output directory: `web/dist`
5. Add environment variables

### Worker (Cloudflare Workers)

```bash
cd worker
npm run deploy
```

## Features

### Pearls Loyalty System

- Earn 10 pearls for each approved booking
- Status tiers:
  - New: 0-9 pearls
  - Bronze: 10-49 pearls
  - Platinum: 50-99 pearls
  - Gold: 100-199 pearls
  - Diamond: 200+ pearls

### Admin Features

- Dashboard with stats
- Manage users
- Create/edit/delete tour deals
- Approve/reject bookings
- Manage custom packages

## Development

### Type Checking

```bash
# Frontend
cd web && npm run typecheck

# Worker
cd worker && npm run typecheck
```

### Building

```bash
# Frontend
cd web && npm run build

# Worker
cd worker && npm run build
```

## License

MIT
