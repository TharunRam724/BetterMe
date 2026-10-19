# BetterMe — Mindful Personal Growth & Habit Application

A calm, premium, modern pastel web application designed for intentional living, daily mood reflection, habit tracking, character trait development, and evidence-based self-insights.

---

## 🌿 Design System & Aesthetics
- **Calm Pastel Palette**: Warm off-white backgrounds (`#FAF8F5`, `#FCFAF7`), delicate borders (`#ECE7DF`), subtle lavender (`#8774B8`, `#EDE7F8`), and soothing sage (`#5B8266`, `#EAF2ED`) accents.
- **Restraint & Clarity**: Generous white space, absence of overwhelming neon gradients, and refined typography powered by **Plus Jakarta Sans** (headings) and **Inter** (body).
- **Responsive & Accessible**: Seamlessly adapts across mobile phones (with drawer and bottom quick bar), tablets, and desktop displays. Includes keyboard navigation (`Escape`, `Enter`, `Tab`), ARIA roles, and clear loading/empty states.

---

## 🛠 Tech Stack
- **Framework**: React 19 + TypeScript + Vite 8
- **Database & Auth**: Supabase (`@supabase/supabase-js`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom pastel utility tokens
- **Icons**: Lucide React (`lucide-react`)
- **Charts**: Recharts (`recharts`) for responsive 7-day emotional rhythm area charts
- **Architecture**: Decoupled service layer with real Supabase Auth and Row Level Security for Traits

---

## 🔐 Supabase Integration & Security Model

### 1. Environment Configuration (`.env`)
The application reads the Supabase configuration from your root `.env` file:
```env
VITE_SUPABASE_URL=https://itxrxgubsvxhcjscjphy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_9pXSVRSVnMhEKj7jZLCOKA_euueBBEp
```
> **Security Note**: Only the public anon key is used. Never expose the service-role or secret key in client-side code.

### 2. Real Persistent Authentication
- **Sign In & Sign Up**: Fully wired to Supabase Auth (`supabase.auth.signInWithPassword` and `supabase.auth.signUp`).
- **Protected Routes**: Private pages (Dashboard, Journal, Mood, Habits, Traits, Insights, Settings) require authentication. Unauthenticated visitors are presented with the calm pastel sign-in screen.
- **Session Persistence**: Sessions are saved and auto-refreshed via `supabase.auth.onAuthStateChange`.
- **Sign Out**: Clean logout removes the session and resets local state.

### 3. Real Supabase `traits` Table Integration
The Character Traits module is connected to your remote Supabase `public.traits` table:
- **Columns Mapped**:
  - `id`: Unique record identifier (UUID)
  - `user_id`: Authenticated user UUID (`auth.uid()`)
  - `name`: Trait name (e.g. *Active Listening*, *Overthinking Decisions*)
  - `category`: Classification & domain (`strength:mindset`, `growth:emotional`, etc.)
  - `notes`: Personal observations and deliberate practice rules
  - `archived`: Boolean archive flag
  - `created_at` / `updated_at`: ISO timestamps
- **Row Level Security (RLS)**:
  - All queries send the authenticated JWT token.
  - Users can only read, create, update, and delete their own traits.
- **Honest Feedback**:
  - If a database operation fails (e.g. network disconnect or policy denial), a clear error alert is displayed. Fake successes are never shown.

### 4. Privacy Commitments
- **In-Memory Journaling**: In adherence to personal privacy guidelines, private journal reflections remain strictly in application session memory and are **never stored in unencrypted browser `localStorage`**.

---

## 🧪 How to Test the Integration

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173).

2. **Test Authentication**:
   - On the sign-in screen, switch to the **Create Account** tab.
   - Enter your name, email, and a password (at least 6 characters), then submit.
   - If email confirmation is enabled on your Supabase project, check your inbox to confirm your email before signing in; otherwise you will be logged in immediately.
   - Switch back to **Sign In** and enter your credentials.

3. **Test the Traits Page (Live Database CRUD)**:
   - Navigate to **Character Traits** in the sidebar.
   - Click **Add Strength** or **Add Growth Area**.
   - Enter a trait name, select a domain, add an observation and practice rule, and save.
   - Notice the live insertion into your Supabase `public.traits` table.
   - Click the **Edit (pencil)** button to update the trait, or the **Archive** icon to toggle archive status.
   - Click the **Delete (trash)** icon to permanently remove the trait from Supabase.
   - Click the **Refresh** icon in the header to re-sync data directly from Supabase.

4. **Test Protected Pages & Logout**:
   - In the header or on the **Settings** page, click the **Sign Out** button.
   - Notice that the application immediately returns to the authentication screen, protecting your private pages.
