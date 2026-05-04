---
trigger: always_on
---

# CCFBC Sunday Message Archive — Antigravity Strategy

## Goal
Build a public web app where church members can review Sunday worship messages each week.

The app should include:
- Message archive
- Add message form
- Summary
- Main Bible verse
- Key points
- Full notes
- Reflection questions
- Easy Bible access
- Public viewing through Vercel

## Branding
Use the provided CCFBC shield logo.

Recommended location:
```txt
src/assets/logo-ccfbc.jpg
```

Use the logo in:
- Navbar
- Homepage hero
- Footer
- Admin/add message page if needed

Logo sizes:
```txt
Navbar: 40px to 48px
Homepage: 110px to 160px
Footer: 32px to 40px
```

Do not stretch or distort the logo.

## Theme
Match the logo style:
- Dark navy
- Black
- Blue highlights
- White text
- Silver or light gray borders
- Soft blue glow

Suggested colors:
```css
:root {
  --bg-dark: #05070d;
  --bg-navy: #071527;
  --card: #0b1f36;
  --primary-blue: #0f5fa8;
  --accent-blue: #1e88e5;
  --light-blue: #8ecbff;
  --text: #ffffff;
  --text-soft: #d7e6f5;
  --muted: #8fa7bd;
  --border: #2c4a63;
  --silver: #c7d0d9;
}
```

Background:
```css
background: linear-gradient(135deg, #05070d 0%, #071527 45%, #0b2745 100%);
```

Card style:
```css
background: rgba(11, 31, 54, 0.85);
border: 1px solid rgba(142, 203, 255, 0.18);
border-radius: 24px;
box-shadow: 0 18px 45px rgba(0, 0, 0, 0.35);
```

Logo glow:
```css
filter: drop-shadow(0 0 28px rgba(30, 136, 229, 0.45));
```

## App Name
Use:
```txt
CCFBC Sunday Message Archive
```

Subtitle:
```txt
Review, remember, and reflect on the Word of God shared every week.
```

## Routes
Create or update these routes:
```txt
/
/messages
/messages/:id
/messages/add
/bible
```

For Vite/React on Vercel, add this if refresh gives 404:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## Pages

### Home Page
Include:
- CCFBC logo
- App title
- Subtitle
- Latest message card
- Buttons:
  - View Latest Message
  - Browse Messages
  - Open Bible

### Messages Page
Route:
```txt
/messages
```

Show all messages newest first.

Features:
- Search bar
- Filter by category if possible
- Message cards

Each card shows:
- Title
- Date
- Speaker
- Main Bible verse
- Short summary
- Category badge
- View button

### Message Detail Page
Route:
```txt
/messages/:id
```

Show:
- Title
- Speaker
- Date
- Main Bible verse
- Verse text in highlighted box
- Summary
- Key points
- Full notes
- Reflection questions
- Related verses
- Read in Bible buttons

### Add Message Page
Route:
```txt
/messages/add
```

Form fields:
- Title
- Speaker
- Service date
- Main verse reference
- Main verse text
- Summary
- Key points
- Full notes
- Reflection questions
- Related verses
- Category

Use large textareas for long content.

### Bible Page
Route:
```txt
/bible
```

Features:
- Bible reference input
- Open verse button
- Quick links for common verses

Use this helper:
```js
function getBibleSearchLink(reference) {
  return `https://www.biblegateway.com/quicksearch/?quicksearch=${encodeURIComponent(reference)}`
}
```

## Supabase Table
Create a table named:
```txt
messages
```

SQL:
```sql
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  speaker text,
  service_date date not null,
  main_verse_reference text,
  main_verse_text text,
  summary text,
  key_points jsonb default '[]'::jsonb,
  full_notes text,
  reflection_questions jsonb default '[]'::jsonb,
  related_verses jsonb default '[]'::jsonb,
  category text,
  created_at timestamp with time zone default now()
);
```

Enable public read:
```sql
alter table messages enable row level security;

create policy "Allow public read messages"
on messages for select
using (true);
```

Temporary development insert only if needed:
```sql
create policy "Allow public insert messages for development"
on messages for insert
with check (true);
```

Do not keep public insert forever if the site will be shared widely. Add admin authentication later.

## Data Format

Example message:
```json
{
  "title": "Faith That Pleases God",
  "speaker": "Pastor Name",
  "service_date": "2026-05-03",
  "main_verse_reference": "Hebrews 11:6",
  "main_verse_text": "And without faith it is impossible to please God...",
  "summary": "This message reminds us that faith is necessary in our walk with God.",
  "key_points": [
    "Faith begins with hearing the Word of God.",
    "Faith requires trust and obedience.",
    "Faith grows through trials and prayer."
  ],
  "reflection_questions": [
    "What area of my life needs stronger faith?",
    "How can I obey God this week?",
    "Who can I encourage with this message?"
  ],
  "related_verses": [
    {
      "reference": "Romans 10:17",
      "text": "Faith comes from hearing the message...",
      "note": "This supports the importance of hearing God's Word."
    }
  ],
  "category": "Faith"
}
```

## Components
Create reusable components:
```txt
Navbar
LogoHeader
MessageCard
LatestMessageCard
VerseBox
BibleLinkButton
SearchBar
PageContainer
SectionTitle
```

## Public Access Rules
- Anyone with the Vercel link can view messages.
- Public pages must not require login.
- Supabase SELECT policy must allow public read.
- Do not expose secret keys.
- Do not use Supabase service-role key in frontend.
- Use environment variables only.

## Antigravity Instructions
Before editing code:
1. Read this file.
2. Inspect the project structure.
3. Find routing, Supabase client, assets, and styling files.
4. Add the CCFBC logo properly.
5. Apply the dark blue shield-inspired theme.
6. Build the routes and pages.
7. Connect messages to Supabase.
8. Add Bible access links.
9. Keep the UI mobile-friendly.
10. Run build test.

## Test Checklist
Run:
```bash
npm run build
```

Check:
- Home page loads
- Logo displays
- Messages page loads
- Add message saves to Supabase
- Message detail page works
- Bible links open
- Public link works
- Refresh does not break routes
- Mobile layout is readable

## Do Not Do
- Do not remove working features.
- Do not require login for public reading.
- Do not expose private keys.
- Do not stretch the logo.
- Do not overcomplicate the UI.
