# Daily Reflection Calendar

A full-stack web application where users sign in with Google, answer a daily reflection question, and view their past answers through a calendar interface.

## Features

- Google authentication (NextAuth)
- Daily reflection questions (in French)
- Calendar view of previous answers
- Light and dark mode
- Protected routes for authenticated users

## Tech Stack

- Next.js (App Router) + React
- TypeScript
- Prisma ORM
- SQLite (development)
- Supabase / PostgreSQL (production)
- NextAuth.js (Google OAuth)
- TailwindCSS
- React Markdown
- Deployment with Vercel

## Project Structure

```app/            – Routes, pages, layouts
components/     – Reusable UI components
lib/            – Prisma client, utilities
prisma/         – Schema, migrations, seed script
public/         – Static assets
middleware.ts   – Route protection middleware
```

## Data model (simplified):
```
User           – Profile and auth metadata
Phrase         – Daily questions
UserResponse   – Answers from authenticated users
Account        – NextAuth OAuth accounts
Session        – NextAuth sessions

```

## Prerequisites

- Node.js (latest LTS)
- npm or yarn
- Google OAuth credentials
- Supabase account
- Vercel account

## Installation

1. Clone the repository  
git clone https://github.com/kathiouchka/daily-reflection-calendar.git  
cd daily-reflection-calendar

2. Install dependencies  
npm install

3. Create a .env.local file with the following variables (example):

Development:
```DATABASE_URL="file:./dev.db"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Production:
```DATABASE_URL="your-supabase-connection-string"

NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Set up the database  
```npm run prisma:generate
npm run prisma:migrate
npm run seed
```

5. Start the development server  
`npm run dev`

The application will be available at:  
http://localhost:3000

## Deployment

### Supabase (database)

1. Create a project at https://supabase.com  
2. Copy the PostgreSQL connection string  
3. Add DATABASE_URL to Vercel environment variables

### Vercel (hosting)

1. Push the repository to GitHub  
2. Connect it to https://vercel.com  
3. Configure environment variables  
4. Deploy

## Available Scripts

npm run dev – Start development server  
npm run build – Build the application  
npm run prisma:migrate – Run migrations  
npm run prisma:generate – Generate Prisma client  
npm run seed – Seed the database

## Authentication Guide

Google OAuth redirect URIs:

Development:  
http://localhost:3000/api/auth/callback/google

Production:  
https://your-domain.com/api/auth/callback/google

## Development Notes

- SQLite is used for development  
- Supabase/PostgreSQL is used for production  
- Environment variables must be configured locally and on Vercel  
- The seed script fills the database with French reflection questions  

## Contributing

1. Create a feature branch  
2. Commit your changes  
3. Open a pull request 
