# Christian Barcoma | Junior Developer, Philippines

A personal portfolio showcasing my projects, skills, experience, and ways to get in touch.

**Live site:** [chanooo.vercel.app](https://chanooo.vercel.app)

## Features

- Animated loading screen on a fresh page load.
- Home page and portfolio sections for About, Projects, Skills, Experience, and Contact.
- Responsive layouts for mobile, tablet, and desktop.
- Scroll-aware navigation, section links, and page transitions from Home.
- Experience timeline with scroll-based progress and marker states.
- Contact form with client- and server-side validation, a honeypot, submission feedback, and a 30-second successful-submission cooldown.
- Contact email delivery through a Supabase Edge Function backed by Resend.
- Social links in the Contact section.
- Mobile/tablet floating back-to-top button and desktop footer back-to-top button.
- Vercel rewrite for direct access to app routes.

## Tech stack

- **Frontend:** React, Vite, React Router, plain CSS
- **Backend/services:** Supabase Edge Functions, Resend
- **Hosting:** Vercel
- **Linting:** ESLint

### Dependencies

**Runtime dependencies**

- `@supabase/supabase-js` — `^2.118.0`
- `react` — `^19.3.1`
- `react-dom` — `^19.3.1`
- `react-router-dom` — `^7.18.5`

**Development dependencies**

- `@eslint/js` — `^10.0.1`
- `@types/react` — `^19.3.0`
- `@types/react-dom` — `^19.3.0`
- `@vitejs/plugin-react` — `^6.1.2`
- `eslint` — `^10.13.0`
- `eslint-plugin-react-hooks` — `^7.1.1`
- `eslint-plugin-react-refresh` — `^0.5.7`
- `globals` — `^17.13.0`
- `supabase` — `^2.122.0`
- `vite` — `^8.3.5`

## Project structure

```text
.
├── public/                         # Static assets
├── src/
│   ├── assets/icons/               # Social icons
│   ├── components/                 # Navbar, loading screen, particles, floating button
│   ├── hooks/                      # Navigation and timeline hooks
│   ├── lib/supabase.js             # Supabase client
│   ├── pages/                      # Home and portfolio route
│   ├── sections/                   # About, Projects, Skills, Experience, Contact
│   ├── utils/                      # Page transition helpers
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase/
│   ├── config.toml
│   └── functions/send-contact-email/
│       ├── deno.json
│       └── index.ts
├── .env.example
├── package.json
└── vercel.json
```

## Getting started

### Prerequisites

- Node.js and npm
- A Supabase project for local or deployed contact-form delivery

### Install and run

```bash
git clone https://github.com/Ritzqtt/Hey-Its-Christian.git
cd Hey-Its-Christian
npm install
npm run dev
```

Vite prints the local development URL after the server starts.

### Available npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run lint` | Run ESLint. |
| `npm run build` | Create the production build in `dist/`. |
| `npm run preview` | Serve the production build locally. Run `npm run build` first. |

## Environment variables

Create a root-level `.env.local` file for local development:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Get these values from your Supabase project’s API settings. The URL identifies your project; the anon/publishable key is intended for browser use. Keep database access protected with Row Level Security. Never put a Supabase service-role key or Resend API key in a `VITE_` variable.

Restart the Vite development server after changing environment variables. The current `.env.example` contains an outdated Web3Forms variable; use the two variable names above.

## Contact form setup

The Contact form calls the `send-contact-email` Supabase Edge Function. The function sends the message to the portfolio email address through Resend.

In the Supabase dashboard, open **Edge Functions → Secrets** and set:

- `RESEND_API_KEY` — create an API key in the Resend dashboard.
- `RESEND_FROM_EMAIL` — a sender address verified for your Resend domain. If using Resend’s `onboarding@resend.dev` sender, Resend restricts delivery to the email address associated with your Resend account.

These are server-side secrets. Do not add them to frontend environment variables or commit them to Git.

Deploy the function with the Supabase CLI:

```bash
npx supabase login
npx supabase functions deploy send-contact-email --project-ref <your-project-ref>
```

Replace `<your-project-ref>` with the reference for your Supabase project.

## Deployment on Vercel

1. Import the repository into Vercel or connect it to your existing Vercel project.
2. In **Project → Settings → Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the deployment environments you use.
3. Keep `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in Supabase Edge Function secrets, not in Vercel frontend variables.
4. Push changes to `main` to trigger a deployment.

The root `vercel.json` rewrites requests to `index.html`, allowing Vercel to serve the single-page app for direct route visits and reloads.

## Contact

**Christian Barcoma**
[cobarcoma@gmail.com](mailto:cobarcoma@gmail.com)
