# CODE RELAY

An intense, multi-round technical challenge platform built for high-stakes coding competitions. Features live code execution, real-time leaderboards, team synchronization, and dynamic web-socket powered rounds.

## Features

- **Phase 1: Custom Auth & Team Management** 
  - Secure email/password login.
  - Create and join teams with invite codes.
  - Custom Admin bypass authentication for the master console.
  
- **Phase 2: Master Admin Console** 
  - Initialize the main event.
  - Control round states (START/PAUSE) with real-time websocket pushes to participant dashboards.
  - One-click Seed Data injection.

- **Phase 3: Code Execution Sandbox** 
  - Integrated Monaco Editor (VS Code engine).
  - Multi-language support (JavaScript, Python, C++, Java).
  - Secure, remote code execution via Piston API with streaming console output.

- **Phase 4: Real-time Leaderboard**
  - Supabase WebSockets instantly sync scores across all active clients.
  - Animated, cyberpunk "Hacker Arena" aesthetic.

- **Phase 5: Custom Dynamic Rounds**
  - **Round 1 (Code IQ):** Standard problem solving with compilation tests.
  - **Round 2 (Triple Strike):** 3-attempt lockout mechanism. If you fail 3 times, your editor freezes.
  - **Round 3 (Code Auction):** High-concurrency live bidding using accumulated leaderboard points.
  - **Round 4 (Relay Finale):** Multiplayer live-sync editor. Teams pass a "baton" back and forth, only the active coder can type while the rest watch in real-time.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database & Auth:** Supabase (Postgres)
- **Realtime:** Supabase Channels / WebSockets
- **Code Execution:** Piston API (Docker Sandbox)
- **Editor:** @monaco-editor/react

## Local Setup

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Supabase Setup**
   - Create a project on [Supabase](https://supabase.com/).
   - Run the SQL migration file located in `supabase/migrations/00000000000000_initial_schema.sql` in your Supabase SQL Editor.
   - Get your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and put them in a `.env.local` file.

3. **Run the Dev Server**
   ```bash
   npm run dev
   ```

## Admin Controls
To access the Admin Console, navigate to `/admin-login`.
- **Username:** `admin789`
- **Password:** `Admin@1410`

Once logged in, click **"Initialize Event"**, then click **"Seed Mock Data"** to populate the 4 rounds with problems and dummy teams. You can then START and PAUSE rounds at your discretion.
