# Code Relay Platform

Welcome to the Code Relay platform repository.

## Getting Started

1. **Install Dependencies**: 
   ```bash
   npm install
   ```
2. **Supabase Setup**:
   - Create a new project on [Supabase](https://supabase.com).
   - Go to SQL Editor in your Supabase dashboard and run the SQL migration script located at `supabase/migrations/00000000000000_initial_schema.sql`.
   - Copy your Project URL and Anon Key into `.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
     ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Adding a New Round Type (For Developers)
The system is built to support dynamic rounds. If you need to create a `Round 05`:
1. Create a new component in `src/components/rounds/Round05.tsx`.
2. Ensure it accepts `RoundProps` (config, team details, submit callback).
3. Update the database constraint in `public.rounds` to accept the new type enum.
