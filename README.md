# ⚡ TITAN SPORTS // College Sports Club & Championship Hub

A modern, broadcast-styled collegiate athletic web platform inspired by ESPN and UEFA tournament portals. Built with **React 19**, **Tailwind CSS**, **Framer Motion**, and **Supabase (Auth, Database, Storage, Row Level Security)**.

---

## 🎨 Visual Identity & Architecture

- **Visual Style**: ESPN / UEFA tournament broadcast & high-performance SaaS aesthetic. Dark Obsidian canvas (`#070A0F` / `#0B0F17`), high-energy Electric Lime (`#B8FF3D`), vivid accent glows, and alternating section rhythm.
- **Typography**: `Space Grotesk` for punchy broadcast headings and scores; `Inter` for clean editorial body text.
- **Mobile First**: Dedicated bottom navigation (`Home`, `Events`, `Rankings`, `Profile`) designed for thumb reach.
- **Dual-Mode Engine**: Runs immediately with pre-loaded mock data and localStorage sync, and seamlessly connects to a live **Supabase** backend when credentials are provided in `.env.local`.

---

## 🚀 Key Modules & Capabilities

### 1. Varsity Sports Directory (`EditorialSportGrid.tsx`)
- Asymmetric bento grid with hover zoom & stat reveal (active athletes, coach, venue).
- Sports Detail Modal featuring training timetables, head coach contact details, venue capacity, and official tournament rules.

### 2. Tournaments & Interactive Brackets (`TournamentHub.tsx`, `BracketView.tsx`)
- Broadcast tournament hub: Overview, Teams, Fixtures, Bracket, and Results.
- Multi-round single-elimination tournament bracket with **animated qualification transitions** powered by Framer Motion.
- Match status ribbons: `LIVE` (with pulsing indicator), `NEXT`, `FINAL RESULT`, `QUALIFIED`, and `CHAMPION`.
- Live Match Center with period timers, goalscorers, and admin score console.

### 3. Squad Builder & Registrations (`TeamBuilderModal.tsx`, `TournamentRegisterModal.tsx`)
- Team captains create squads, assign jersey numbers, and enforce min/max player limits.
- Eligibility checks and instant issuance of digital QR entry passes.

### 4. Campus Sports Cup (`CampusCupLeaderboard.tsx`)
- Inter-Department and Inter-Hostel championship leaderboards with top 3 gold/silver/bronze podium cards.
- Real-time movement indicators (↑ Green, ↓ Red, — Neutral).
- Configurable placement scoring: 1st (Gold) +100pts, 2nd (Silver) +60pts, Semifinal +30pts, Participation +10pts.

### 5. Athlete Identity & Digital ID (`AthleteIdentityCard.tsx`)
- Holographic player badge with photo avatar, student ID, department, and scannable QR badge.
- Verifiable certificates with instant high-resolution **PDF generation** (`jsPDF`) including gold foil seal and unique serial hashes.
- Player statistics and win-rate record.

### 6. Timeline Schedule & Press Feed (`TimelineCalendar.tsx`, `EditorialNewsFeed.tsx`)
- Categorized chronological schedule of upcoming matches, trials, and finals.
- Editorial magazine news feed with hero featured story and modal reader.

### 7. Masonry Photography Gallery (`MasonryGallery.tsx`)
- Asymmetric multi-column masonry with sport filters and full-screen lightbox preview.

### 8. Admin Operations Cockpit (`AdminDashboard.tsx`)
- Information-dense control desk:
  - Metric counters (Athletes, Active Tournaments, Checked-in Passes, Cup Leaders).
  - **QR Code Attendance Scanner**: Verifies athlete passes and records venue presence.
  - Auto-fixture generator for single-elimination brackets.
  - Press dispatch studio.
  - Official sports certificate issuer.

---

## 🗄️ Database & Supabase Integration

A complete PostgreSQL schema with all 19 entities and Row Level Security (RLS) is located at:
```
E:\Sports Club\supabase\schema.sql
```

### Applying Schema to Supabase:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Copy and run the entire content of [`supabase/schema.sql`](./supabase/schema.sql).
4. Configure your `.env.local` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Production build
npm run build
```

---

## 👥 Instant Role Switching (Demo Mode)

A dedicated role switcher pill is integrated directly in the top navigation bar. Click **Role: Member / Admin / Public** to instantly test the platform from different user perspectives:
- **Public Guest**: Explore sports, read tournament brackets, check Campus Cup standings.
- **Team Captain / Member**: View athlete passport, register for tournaments, download certificates, manage squad.
- **Sports Director / Admin**: Control live match scores, advance bracket winners, scan athlete QR passes, and publish dispatches.
