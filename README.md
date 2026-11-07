# Event Connect

A full-stack **campus event management platform**. Students discover and enroll in events, organizers (clubs) publish and manage events and their participants, and admins moderate content and approve events.

Built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend, with JWT authentication, email verification over Gmail SMTP, and image uploads to Cloudinary.

The interface is a clean **black & white glass design** with **dark and light themes**, a floating rounded header, a macOS Dock–style tab bar on the home screen, and smooth, restrained animation built with **Framer Motion** and **GSAP**. It is responsive from phones to wide desktops.

> Every change to the project is logged step by step in [`plan.md`](plan.md). Interview-style questions about the project are in [`prep.txt`](prep.txt).

---

## Table of Contents

**Part A: Knowledge transfer (read first)**
1. [Start Here](#start-here)
2. [Glossary](#glossary)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [User Workflows](#user-workflows)
6. [How a Request Flows Through the Code](#how-a-request-flows-through-the-code)

**Part B: Reference**

7. [Features](#features)
8. [Tech Stack](#tech-stack)
9. [UI & Design System](#ui--design-system)
10. [Project Structure](#project-structure)
11. [High-Level Design (HLD)](#high-level-design-hld)
12. [Low-Level Design (LLD)](#low-level-design-lld)
    - [Data Model (ER Diagram)](#data-model-er-diagram)
    - [Backend Class / Module Diagram](#backend-class--module-diagram)
    - [Frontend Component Tree](#frontend-component-tree)
    - [Sequence Diagrams](#sequence-diagrams)
    - [Auth & Verification State Machine](#auth-and-verification-state-machine)
    - [Event Lifecycle](#event-lifecycle)
13. [API Reference](#api-reference)
14. [Frontend Routes](#frontend-routes)
15. [Validation Rules](#validation-rules)

**Part C: Working on the project**

16. [How to Add a Feature](#how-to-add-a-feature)
17. [Development Workflow & Checks](#development-workflow--checks)
18. [Deployment](#deployment)
19. [Troubleshooting](#troubleshooting)
20. [Known Issues & Limitations](#known-issues--limitations)
21. [Future Improvements](#future-improvements)
22. [Learning Path for New Contributors](#learning-path-for-new-contributors)
23. [Credits](#credits)

---

## Start Here

### What the app does, in one minute
- **Students** sign up, verify their email, browse campus events, enroll, earn reward points, comment, and see their events on a calendar.
- **Organizers** (clubs) sign up with a club logo, post events with images and a sample certificate, edit or delete them, and export participant lists to Excel or PDF.
- **Admins** can approve events and delete any comment. Today this is API-only; the admin UI is a set of shortcut cards.

### The mental model
```
Browser (React SPA, Vite, port 5173)
   │  axios → `${VITE_API_URL}/...`   header  Authorization: <JWT>
   ▼
Express API (Node, port 4000) ── routers: /auth /event /student /organiser /admin
   │  Mongoose
   ▼
MongoDB (Students, Organizers, Admins, Events, verification tokens)

Side services: Cloudinary (the browser uploads images directly) · Gmail SMTP (verification emails)
```

### Five facts that save hours
1. **Two apps, two terminals.** `Server/` (Express, `npm start`) and `Client/` (React, `npm run dev`). Each has its own `package.json`, `node_modules` and `.env`.
2. **The client finds the API through `VITE_API_URL`** in `Client/.env`. If it's missing, every request goes to `undefined/...` and fails. Restart Vite after editing `.env`.
3. **The JWT is sent raw** in the `Authorization` header (no `Bearer ` prefix). It's stored in `localStorage.token`. The logged-in user lives in the Recoil `userAtom`, which is also saved to `localStorage`.
4. **Routes are defined in `Client/src/main.jsx`.** `routes.jsx` and `LandingPageLayout.jsx` exist but aren't used.
5. **The URL param named `:emailId` actually holds the username.** Sign-in navigates to `/{role}-profile/<username>`.

---

## Glossary

| Term | Meaning in this codebase |
|---|---|
| **Organizer / Organiser** | Both spellings are used. A club account that posts events. API prefix `/organiser`, model `Organizer`, route `/organizer-profile/...` |
| **Calender** | Misspelling used in file and route names (`Customcalender.jsx`, `/studentCalender`). Keep it when you link to these files and routes |
| **`userAtom`** | Recoil atom with `{ username, email, role, _id, isLoggedIn }`, persisted to `localStorage` |
| **`verifyUser`** | Express middleware. Reads the JWT from `Authorization`, sets `req.userId`, or returns 401 |
| **`validPerson` / `validAdmin`** | Role guards. They check that `req.userId` exists in the `Organizer` / `Admin` collection |
| **Verification token** | 32-byte hex string in `StudentToken` / `OrganizerToken`. Deleted by MongoDB after 1 hour (TTL index) |
| **Unsigned upload preset** | Cloudinary setting that lets the browser upload without a server-side signature |
| **Glass** | The translucent, blurred surface style (`.glass`, `.glass-strong`, `.glass-bar` in `index.css`) |
| **Dock** | The macOS-style tab bar on the Home page (`components/ui/Dock.jsx`) |
| **`plan.md`** | Log of every change, by phase. Read it to learn why things are the way they are |

---

## Getting Started

### Prerequisites
- **Node.js 18+** and npm
- **MongoDB**: local, or a free MongoDB Atlas cluster
- **Gmail account with an App Password** (Google Account → Security → 2-Step Verification → App passwords). Your normal password won't work for SMTP.
- **Cloudinary account** with an **unsigned upload preset** (Settings → Upload → Upload presets → Add → Signing mode: Unsigned)

### 1. Clone
```bash
git clone https://github.com/Vinaykumarp2005/Event-Connect.git
cd Event-Connect
```

### 2. Backend (terminal 1)
```bash
cd Server
npm install
# create Server/.env (see Environment Variables)
npm start              # node server.js → "server is running ... on port 4000"
```
You should also see `database is successfully connected to the backend`. If you don't, check `DB_URL`.

### 3. Frontend (terminal 2)
```bash
cd Client
npm install
# create Client/.env (see Environment Variables)
npm run dev            # → http://localhost:5173
```
Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

### 4. First run checklist
1. Open `http://localhost:5173` → the landing page loads.
2. **Sign up** as a student. Check the inbox of that email for the verification link and click it. It opens `/verifyPage/student/<id>/<token>` and redirects to Sign In.
3. **Sign in**. You land on `/student-profile/<username>` (Home with the Dock).
4. Sign up as an **organizer** in another browser profile, verify, and post an event. It shows up in the student's Events tab.

### 5. Create an admin (no UI for this)
```bash
curl -X POST http://localhost:4000/admin/signUp \
  -H "Content-Type: application/json" \
  -d '{"name":"admin","email":"admin@example.com","password":"admin@1234"}'
```
Then sign in on `/signin` with the role set to Admin.

---

## Environment Variables

> Never commit `.env` files. Both `Server/.gitignore` and `Client/.gitignore` already ignore them. Share values privately.

### `Server/.env`

| Key | Example | Description |
|---|---|---|
| `DB_URL` | `mongodb+srv://user:pass@cluster/eventconnect` | MongoDB connection string |
| `JWT_SECRET` | any long random string | Secret used to sign JWTs |
| `PORT` | *(leave unset locally)* | API port (default `4000`). Hosting platforms set it automatically. Not used for email |
| `USER` | `you@gmail.com` | Gmail address that sends the emails. On hosts where `USER` is already the system login name, set `MAIL_USER` instead |
| `PASS` | 16-char App Password | Gmail **App Password** (spaces are removed automatically). Your normal Gmail password won't work. `MAIL_PASS` also works |
| `HOST` | `smtp.gmail.com` | SMTP host (default `smtp.gmail.com`). `MAIL_HOST` also works |
| `MAIL_PORT` | `465` | Optional. SMTP port (default `465`) |
| `MAIL_SECURE` | `true` | Optional. `true` for port 465, `false` for 587. Defaults from the port |
| `SERVICE`, `SECURE` | | No longer read (replaced by `MAIL_PORT` / `MAIL_SECURE`). Safe to leave in the file |
| `BASE_URL` | `http://localhost:5173` | Frontend origin used inside verification links |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | | Reserved for server-side uploads (currently unused) |

### `Client/.env`

| Key | Example | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | Base URL of the Express API. No trailing slash |
| `VITE_CLOUDINARY_CLOUD_NAME` | your cloud name | Used by SignUp (logo) and PostEvent/EventsById (images) |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | your unsigned preset | Same as above |

Vite reads `.env` only at startup, so **restart `npm run dev`** after changing it. Only variables starting with `VITE_` reach the browser.

---

## User Workflows

### Student journey
```mermaid
flowchart LR
    A[Landing page] --> B[Sign Up<br/>role = Student]
    B --> C[Email with verification link]
    C --> D[VerifyPage<br/>→ verified]
    D --> E[Sign In]
    E --> F["Home (Dock)"]
    F --> G[Events tab]
    G --> H[Event details]
    H --> I{Enroll}
    I -->|not already enrolled| J[Enrolled + reward points]
    H --> K[Comment / edit / delete own]
    F --> L[Enrolled tab]
    F --> M[My Calendar / Calendar]
    F --> N[Gallery → Club page → events]
    F --> O[Dashboard → edit profile, see points]
```

### Organizer journey
```mermaid
flowchart LR
    A[Sign Up<br/>role = Organizer] --> A2[Logo → Cloudinary]
    A2 --> B[Verify email] --> C[Sign In]
    C --> D["Home (Dock)"]
    D --> E[Post Event<br/>image + certificate → Cloudinary]
    E --> F[Confetti + toast]
    D --> G[Created events]
    G --> H[Event details → Edit / Delete]
    D --> I[Participants page<br/>sidebar]
    I --> J[Pick event → Export Excel / PDF]
    D --> K[Calendar / My Calendar]
    D --> L[Dashboard → stats]
```

### Admin journey (today)
```mermaid
flowchart LR
    A[Create admin via curl] --> B[Sign In as Admin]
    B --> C[Admin dashboard: shortcut cards]
    B --> D[Browse events and details]
    B -.API only.-> E[PUT approve / update event]
    B -.API only.-> F[PUT delete any comment]
```

### Home tabs by role (`common/Home.jsx`)
| Tab | Student | Organizer | Component |
|---|---|---|---|
| Events | ✅ | ✅ | `Events` |
| Enrolled | ✅ | | `EnrolledEvents` |
| My Calendar | ✅ | | `StudentCalender` |
| Post Event | | ✅ | `PostEvent` |
| Created | | ✅ | `CreatedEvents` |
| Calendar | ✅ | ✅ | `Customcalender` |
| Gallery | ✅ | | `GalleryHomePage` |
| Dashboard | ✅ | ✅ | `StudentDashBoard` / `OrganizerDashBoard` |

The same pages are also reachable from the **sidebar**, which navigates to real URLs (see [Frontend Routes](#frontend-routes)). The Dock switches components in place without changing the URL.

---

## How a Request Flows Through the Code

Example: **a student enrolls in an event.** Follow the files in this order and you'll understand the whole stack.

| Step | Where | What happens |
|---|---|---|
| 1 | `Client/src/main.jsx` | Route `student-profile/:emailId/viewevent/:eventById` renders `EventsById` inside `RootLayout` |
| 2 | `Client/src/components/common/EventsById.jsx` | On mount: `GET ${VITE_API_URL}/event/app/v1/events/:eventId` with `Authorization: localStorage.token` |
| 3 | `Server/server.js` | `app.use('/event', eventApp)` passes the request to the event router |
| 4 | `Server/middlewares/verifyUser.js` | `jwt.verify(token, JWT_SECRET)` → `req.userId`. Invalid → 401 |
| 5 | `Server/apis/Event.js` | Handler loads the event and returns it with `isEnrolled` for this user |
| 6 | `EventsById.jsx` | User clicks **Enroll** → `PUT /event/app/v1/update/student/:eventId` with `{ enroll: true, name, rewardPoints }` |
| 7 | `Server/apis/Event.js` | Blocks duplicates, pushes into `event.enrolledStudents`, `enrolled += 1`; pushes into `student.eventsEnrolled`, adds `rewardsEarned` |
| 8 | `Server/models/event.model.js`, `student.model.js` | Mongoose schemas that define those fields |
| 9 | `EventsById.jsx` | Updates the enrolled state and the "spots filled" bar. Errors show the server's `message` |

Every other feature follows the same pattern: **page component → axios call → router in `Server/apis/` → `verifyUser` → (role guard) → Mongoose model → JSON back → update state**.

---

## Features

### Authentication and security
- **Three roles**: Student, Organizer, Admin, each with its own signup/signin flow.
- **Email verification**: on signup, a random 32-byte token is stored and a verification link is emailed via Nodemailer (Gmail SMTP). The token expires automatically after **1 hour** (MongoDB TTL index).
- **Re-send on login**: if an unverified user tries to sign in, a fresh verification email is sent and login is blocked.
- **Password hashing** with bcryptjs.
- **JWT auth**: the token is sent in the `Authorization` header. Organizer tokens expire after 1 hour.
- **Role-based access control**: `verifyUser` middleware decodes the JWT, then route-level guards (`validPerson`, `validAdmin`) check that the user id belongs to the right collection.
- **Request validation** with Zod schemas (signup, signin). An event schema (`validEventData`) is also defined in `Event.js` but isn't attached to the create route yet.
- **Persisted session**: user state lives in a Recoil atom persisted to `localStorage` (`recoil-persist`), so login survives page refresh.

### Student features
- Browse all events in a card grid (name, category, image, dates).
- View full event details: description, venue and map link, fee, FAQs, key takeaways, sample certificate, reward points, and seats left.
- **Enroll in events**. Duplicate enrollments are blocked, and the event's `enrolled` counter is incremented.
- **Earn reward points** on every enrollment (added to `rewardsEarned`).
- **Comments**: add, edit, and delete your own comments on an event.
- **Enrolled events** page.
- **Personal calendar** of enrolled events, and a **global events calendar** of all events. Both open on today and have a side panel listing every event running on the selected day, including multi-day events, with a details pop-up.
- **Home screen** with a centered macOS Dock–style tab bar to switch between Events, Enrolled, My Calendar, Calendar, Gallery and Dashboard.
- **Club gallery**: browse every organizer/club by logo and open a club page listing its events.
- **Dashboard**: view and edit your profile (username, phone, department, year), and see reward points.

### Organizer (club) features
- Signup with club name, position, department, and **club logo uploaded to Cloudinary**.
- **Post events** with the full form: name, description, category, max seats, start/end dates, end time, venue and venue link, registration fee, registration form link, registration end date, reward points, key takeaways, a dynamic FAQ list, an event image, and a sample certificate (both uploaded to Cloudinary). A confetti animation plays on success.
- **Edit / delete** your own events. Ownership is checked on the server.
- **Created events** list.
- **Event participants**: choose one of your events to see the enrolled students, then **export the list to Excel (xlsx) or PDF (jsPDF + autotable)**.
- **Organizer calendar** of your own events (upcoming, in progress, or completed), plus the global calendar.
- **Dashboard**: profile info and stats (total, ongoing, upcoming, and completed events), plus a list of ongoing events.
- **Home screen** Dock with Events, Post Event, Created, Calendar and Dashboard.

### Admin features
- Admin signup (API) and signin.
- **Approve or update any event** (`isApproved` flag), through the API.
- **Moderate comments**: delete any comment on any event, through the API.
- **Admin dashboard** with shortcuts to All Events, Approvals and Moderation. Browse all events and view event details.

### UI / UX
- **Dark and light themes** with a sun/moon toggle in the header. The choice is saved, applied before the page paints (no flash), and switched with a circular reveal. See [UI & Design System](#ui--design-system).
- **Floating rounded header** with space around it, and a **floating rounded sidebar** that is role-aware and collapsible (Recoil `sidebarOpenState`). On phones the sidebar slides in from a button in the header.
- **Glass surfaces**: translucent, blurred cards and bars that work in both themes.
- **Home Dock**: a macOS-style tab bar with gentle magnification and a sliding active indicator.
- **Polished calendars**: custom toolbar, today badge, selected-day highlight, themed events and "+N more" pop-up.
- Loading spinners and friendly empty states on every list. Toasts follow the theme.
- Forms built with React Hook Form, with shared input/button styles.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18, Vite 6 |
| Routing | React Router v6 (nested, role-scoped routes) |
| State | Recoil + recoil-persist |
| Forms | React Hook Form |
| Styling | Tailwind CSS 3 (theme colours via CSS variables, `darkMode: 'class'`), PostCSS, Autoprefixer, `clsx`, `tailwind-merge`, Inter font |
| Animation | **Framer Motion** (`motion` package, `motion/react`), **GSAP** + `@gsap/react` (`useGSAP`, ScrollTrigger) |
| Icons | lucide-react (Home Dock), @tabler/icons-react (everywhere else), react-icons |
| UI libraries | react-big-calendar (+ moment, which it installs), date-fns, react-toastify, react-confetti, react-use, pure-react-carousel |
| Exports | xlsx (Excel), jsPDF + jspdf-autotable (PDF) |
| HTTP client | Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose 9 |
| Auth | jsonwebtoken, bcryptjs |
| Validation | Zod 4 |
| Email | Nodemailer (Gmail SMTP) |
| Media storage | Cloudinary (unsigned upload preset, direct from the browser) |

---

## UI & Design System

### Look and feel
- **Monochrome**: black, white and greys only, with no accent colour.
- **Glass**: translucent surfaces with backdrop blur (`.glass`, `.glass-strong`, `.glass-bar` in `index.css`).
- **Type**: Inter, tight tracking, a soft white-to-grey gradient on headings (`.text-gradient`).
- **Shared controls**: `.field`, `.field-label`, `.field-error`, `.btn-primary`, `.btn-ghost`, `.chip`.

### Theming (dark / light)

Tailwind's `white`, `black` and `neutral-*` colours resolve to CSS variables. In light mode the variables swap: "white" becomes the ink colour, "black" becomes the paper colour, and the grey scale reverses. Ordinary classes like `text-white`, `bg-white/10` and `text-neutral-400` therefore work in both themes without per-component changes.

```mermaid
flowchart LR
    T["ThemeToggle<br/>(header)"] -->|toggleTheme| H["useTheme hook"]
    H -->|set| A["themeAtom<br/>(Recoil, persisted)"]
    H -->|"html.dark / html.light"| R[":root CSS variables<br/>--c-white · --c-black · --c-n50…950<br/>--glass-* · --page-bg"]
    R --> TW["Tailwind colours<br/>white · black · neutral"]
    TW --> UI["Every component"]
    A -.->|"recoil-persist → localStorage"| S["index.html inline script<br/>applies saved theme before React (no flash)"]
    H -->|"View Transitions API"| V["Circular reveal<br/>(instant fallback)"]
```

| Piece | File |
|---|---|
| Colour tokens, light palette, glass, calendar styles | `Client/src/index.css` |
| Tailwind colour mapping (`rgb(var(--c-*) / <alpha-value>)`) | `Client/tailwind.config.js` |
| Theme state + toggle logic | `Client/src/components/theme/useTheme.js` |
| Sun/moon button | `Client/src/components/theme/ThemeToggle.jsx` |
| No-flash script | `Client/index.html` |

### Layout
- **Header**: a floating `rounded-full` glass pill, inset from the edges (`top-4`, side gaps). It holds the brand, role badge, theme toggle and auth buttons, and gains a soft shadow once the page scrolls. On phones it also holds the sidebar button.
- **Sidebar**: a floating rounded glass panel (`left-4 top-24 bottom-4`), collapsible on desktop and a slide-in drawer on phones. The active item has a white pill that slides between links.
- **Content**: `pt-24` clears the floating header, and the left margin follows the sidebar width.

### Animation
Animation is deliberately simple: one-time entrances, gentle hovers, and no looping or decorative effects.

| Library | Where |
|---|---|
| **GSAP** | Landing intro (hero copy, then sample cards); one-time scroll fade-ups (features, call to action); Home intro; Dock click press |
| **Framer Motion** | Header and page fade-ins; staggered card grids; small hover lift on cards; sliding active pills (sidebar, sign-up role switch); Dock magnification and active indicator; hero word swap; modal, FAQ and comment transitions; theme icon swap |

- `MotionConfig reducedMotion="user"` and GSAP `matchMedia` respect the OS "reduce motion" setting.
- Effects that rely on hovering are turned off on touch screens.

### Shared UI components (`Client/src/components/ui/`)
| Component | Purpose |
|---|---|
| `Page.jsx` | `Page` (fade-up wrapper), `PageHeader`, `EmptyState`, `Spinner`, stagger variants |
| `EventCard.jsx` | Glass event card used by every event list |
| `Stat.jsx` | `StatTile`, `InfoRow`, `Avatar` for the dashboards |
| `CalendarView.jsx` | Shared calendar: custom toolbar, month grid, day panel, details pop-up (portaled) |
| `Dock.jsx` | macOS Dock–style tab bar for Home: scale-only magnification (no layout shift), always-visible labels, sliding active indicator |

---

## Project Structure

```
Event-Connect/
├── Client/                         # React + Vite frontend
│   ├── .env                        # VITE_API_URL, VITE_CLOUDINARY_* (not committed)
│   ├── index.html                  # Inter font + no-flash theme script
│   ├── vercel.json                 # SPA rewrite: every path → index.html
│   ├── src/
│   │   ├── main.jsx                # App entry + all route definitions (+ MotionConfig)
│   │   ├── RootLayout.jsx          # Header + Sidebar + <Outlet/> + Footer + themed Toasts
│   │   ├── routes.jsx              # UNUSED draft router (main.jsx is the real one)
│   │   ├── LandingPageLayout.jsx   # UNUSED (only imported by routes.jsx)
│   │   ├── index.css               # Theme tokens, glass, shared form/button styles, calendar styles
│   │   ├── components/
│   │   │   ├── UserAtom.js         # Recoil user atom (persisted)
│   │   │   ├── atoms/sidebarAtom.js
│   │   │   ├── theme/              # useTheme (themeAtom + toggle), ThemeToggle
│   │   │   ├── common/             # Shared pages: Landing, Home, SignIn/Up, Verify, Events,
│   │   │   │                       # EventsById, Customcalender, Gallery, ClubEvents, Header, Sidebar, Footer
│   │   │   ├── students/           # StudentDashBoard, EnrolledEvents, StudentCalender
│   │   │   ├── organizer/          # OrganizerDashBoard, PostEvent, CreatedEvents,
│   │   │   │                       # EventParticipants, OrganiserCalender, FetchEvents
│   │   │   ├── admin/              # AdminDashBoard (shortcuts), ManageEvents (coming soon)
│   │   │   └── ui/                 # Page, EventCard, Stat, CalendarView, Dock (+ legacy sidebar.jsx)
│   │   ├── hooks/use-outside-click.js
│   │   └── lib/utils.jsx
│   ├── tailwind.config.js          # darkMode: 'class', theme colours → CSS variables
│   └── vite.config.js              # '@' alias → src/
│
├── Server/                         # Express backend
│   ├── .env                        # DB_URL, JWT_SECRET, SMTP, BASE_URL (not committed)
│   ├── server.js                   # App bootstrap, DB connect (DNS 8.8.8.8/1.1.1.1), router mounting
│   ├── apis/
│   │   ├── Auth.js                 # /auth      – student & organizer signup/signin/verify
│   │   ├── Event.js                # /event     – event CRUD, enrollment, comments
│   │   ├── User.js                 # /student   – profile, enrolled events, comments
│   │   ├── Organizer.js            # /organiser – profile, list all organizers
│   │   └── Admin.js                # /admin     – signup/signin, approve, moderate
│   ├── middlewares/verifyUser.js   # JWT verification
│   ├── models/                     # Mongoose schemas
│   │   ├── student.model.js
│   │   ├── organizer.model.js
│   │   ├── admin.model.js
│   │   ├── event.model.js          # + embedded faq, comment, enrolledStudents
│   │   ├── tokenStudent.js         # TTL 1h verification tokens
│   │   └── tokenOrganiser.js
│   └── utils/
│       ├── mailer.js               # Shared Nodemailer transport, startup check, verification email (HTML)
│       ├── sendUserEmail.js        # Thin wrapper → mailer (students)
│       └── sendOrganiserEmail.js   # Thin wrapper → mailer (organizers)
│
├── plan.md                         # Change plan + step-by-step log of every change
├── README.md
└── prep.txt                        # Interview prep notes for the project
```

---

## High-Level Design (HLD)

### System architecture

```mermaid
flowchart LR
    subgraph Browser["Browser (React SPA – Vite)"]
        UI["Pages & Components<br/>(Student / Organizer / Admin)"]
        RS["Recoil Store<br/>userAtom · themeAtom (persisted) · sidebarOpenState"]
        LS[("localStorage<br/>JWT token · recoil-persist")]
        EX["Client-side Exporters<br/>xlsx · jsPDF"]
        UI <--> RS
        RS <--> LS
        UI --> EX
    end

    subgraph Server["Node.js / Express API (monolith)"]
        MW["CORS · JSON parser"]
        AUTH["/auth router"]
        EVT["/event router"]
        STU["/student router"]
        ORG["/organiser router"]
        ADM["/admin router"]
        JWT["verifyUser (JWT)"]
        GUARD["Role guards<br/>validPerson · validAdmin"]
        ZOD["Zod validators"]
        MAIL["Mailer utils"]
        MW --> AUTH & EVT & STU & ORG & ADM
        EVT & STU & ORG & ADM --> JWT --> GUARD
        AUTH & EVT & ADM --> ZOD
        AUTH --> MAIL
    end

    DB[("MongoDB<br/>Students · Organizers · Admins<br/>Events · Verification Tokens (TTL)")]
    CLD["Cloudinary<br/>(images, logos, certificates)"]
    SMTP["Gmail SMTP"]
    INBOX["User's Inbox"]

    UI -- "REST / JSON + Authorization: <JWT>" --> MW
    UI -- "Unsigned upload → secure_url" --> CLD
    Server -- "Mongoose ODM" --> DB
    MAIL -- "Nodemailer" --> SMTP --> INBOX
    INBOX -- "Verification link → /verifyPage/:role/:id/:token" --> UI
```

### Key design decisions

| Decision | Rationale |
|---|---|
| **Role-split routers** (`/auth`, `/event`, `/student`, `/organiser`, `/admin`) | Each role has separate responsibilities, so changing one area is unlikely to break another. |
| **Separate collections per role** (Student / Organizer / Admin) | Each role has different profile fields. Access is decided by which collection the JWT's `userId` belongs to. |
| **Direct browser → Cloudinary uploads** | The backend never handles binary files. It only stores the returned URLs, which keeps the API lightweight. |
| **Embedded sub-documents in Event** (comments, FAQs, enrolledStudents) | These are always read together with the event, so one read returns the whole event page. |
| **Two-sided enrollment** (`Event.enrolledStudents` and `Student.eventsEnrolled`) | Lookups are fast both ways: participants per event, and events per student. |
| **TTL-indexed token collections** | Verification links expire after 1 hour, and MongoDB deletes them without any cron job. |
| **Client-side exports** | Excel and PDF files are generated in the browser, so no export service is needed. |

### Role / use-case overview

```mermaid
flowchart TB
    S((Student))
    O((Organizer))
    A((Admin))

    subgraph Platform["Event Connect"]
        U1[Sign up / Verify email / Sign in]
        U2[Browse events & calendar]
        U3[View event details]
        U4[Enroll & earn reward points]
        U5[Comment / edit / delete own comment]
        U6[Browse clubs gallery]
        U7[Manage own profile]
        U8[Post event with media]
        U9[Edit / delete own events]
        U10[View participants & export Excel/PDF]
        U11[Approve / update any event]
        U12[Delete any comment]
    end

    S --> U1 & U2 & U3 & U4 & U5 & U6 & U7
    O --> U1 & U2 & U3 & U7 & U8 & U9 & U10
    A --> U1 & U2 & U3 & U11 & U12
```

---

## Low-Level Design (LLD)

### Data model (ER diagram)

```mermaid
erDiagram
    STUDENT {
        ObjectId _id PK
        String username UK "lowercase, trimmed"
        String email UK
        Number phoneNumber UK
        String password "bcrypt hash"
        String collegeName
        String department
        Number year
        ObjectId[] eventsEnrolled FK
        Number rewardsEarned "default 0"
        String role
        Boolean verified "default false"
        Date createdAt
        Date updatedAt
    }

    ORGANIZER {
        ObjectId _id PK
        String username UK
        String[] clubName UK
        String email UK
        Number phoneNumber UK
        String password "bcrypt hash"
        String collegeName
        String department
        String position
        String logo "Cloudinary URL"
        ObjectId[] eventsCreated FK
        String role
        Boolean verified "default false"
    }

    ADMIN {
        ObjectId _id PK
        String name
        String email UK
        String password "bcrypt hash"
        ObjectId isAccepted FK
    }

    EVENT {
        ObjectId _id PK
        String eventName UK
        String description
        String category
        Number maxLimit
        Number enrolled "default 0"
        Date startDate
        Date endDate
        String endTime
        Date registrationEndDate
        Number registrationFee
        String venue
        String venueAddress "map link"
        String keyTakeAways
        Number rewardPoints
        String registrationForm "link"
        String[] eventImage "Cloudinary URLs"
        String sampleCertificate "Cloudinary URL"
        Boolean isApproved "default false"
        ObjectId organiser FK
    }

    FAQ {
        ObjectId _id
        String question
        String answer
    }

    COMMENT {
        ObjectId _id
        String content
        ObjectId owner FK
        String name
        Date createdAt
    }

    ENROLLED_STUDENT {
        ObjectId studentId FK
        String name
    }

    STUDENT_TOKEN {
        ObjectId userId FK "unique"
        String token "32-byte hex"
        Date createdAt "TTL 3600s"
    }

    ORGANIZER_TOKEN {
        ObjectId userId FK "unique"
        String token "32-byte hex"
        Date createdAt "TTL 3600s"
    }

    ORGANIZER ||--o{ EVENT : "organises"
    EVENT ||--o{ FAQ : "embeds"
    EVENT ||--o{ COMMENT : "embeds"
    EVENT ||--o{ ENROLLED_STUDENT : "embeds"
    STUDENT ||--o{ ENROLLED_STUDENT : "is"
    STUDENT }o--o{ EVENT : "eventsEnrolled"
    STUDENT ||--o{ COMMENT : "writes"
    STUDENT ||--o| STUDENT_TOKEN : "verifies with"
    ORGANIZER ||--o| ORGANIZER_TOKEN : "verifies with"
    ADMIN }o--o| EVENT : "approves"
```

### Backend class / module diagram

```mermaid
classDiagram
    direction LR

    class Server {
        +express app
        +connect(DB_URL)
        +use('/auth', authApp)
        +use('/event', eventApp)
        +use('/student', studentApp)
        +use('/organiser', organizerApp)
        +use('/admin', adminApp)
        +listen(port)
    }

    class verifyUser {
        <<middleware>>
        +verifyUser(req, res, next)
        reads req.headers.authorization
        sets req.userId
    }

    class AuthRouter {
        -validStudentDataSignup()
        -validOrganiserDataSignup()
        -validUserData()
        +POST student/signUp
        +POST student/signin
        +GET student/:id/verifyStudent/:token
        +POST organizer/signUp
        +POST organizer/signin
        +GET organizer/:id/verifyOrganizer/:token
    }

    class EventRouter {
        -validEventData()
        -validPerson() organizer guard
        +POST app/v1/create
        +GET app/v1/events
        +GET app/v1/events/:eventId
        +GET app/v1/organiser/events
        +GET app/v1/events/details/:organiserId
        +POST app/v1/event/update/:eventId
        +PUT app/v1/update/student/:eventId
        +PUT app/v1/comment/update/:eventId/:commentId
        +DELETE app/v1/comment/delete/:eventId/:commentId
        +DELETE app/v1/event/delete/:eventId
        +GET students/enroll/:eventId
    }

    class StudentRouter {
        +GET getdetails
        +GET enrolledEvents
        +PUT update/profiledetails
        +PUT comment/:eventId
        +PUT comment/:eventId/:commentId
    }

    class OrganizerRouter {
        +GET getdetails
        +PUT update/profiledetails
        +GET get/organiserDetails
    }

    class AdminRouter {
        -validateAdminData()
        -validAdmin() admin guard
        +POST signUp
        +POST signin
        +PUT app/v1/event/update/:eventId
        +PUT event/comment/:eventId/:commentId
    }

    class Mailer {
        <<utils>>
        +sendVerificationEmail(to, link) throws on failure
        +verifyMailer() startup login check
        +sendEmail / sendOrganiserEmail wrappers
    }

    class Student { <<Mongoose Model>> }
    class Organizer { <<Mongoose Model>> }
    class Admin { <<Mongoose Model>> }
    class Events { <<Mongoose Model>> }
    class StudentToken { <<Mongoose Model>> }
    class OrganizerToken { <<Mongoose Model>> }

    Server --> AuthRouter
    Server --> EventRouter
    Server --> StudentRouter
    Server --> OrganizerRouter
    Server --> AdminRouter

    EventRouter ..> verifyUser
    StudentRouter ..> verifyUser
    OrganizerRouter ..> verifyUser
    AdminRouter ..> verifyUser

    AuthRouter --> Student
    AuthRouter --> Organizer
    AuthRouter --> StudentToken
    AuthRouter --> OrganizerToken
    AuthRouter --> Mailer

    EventRouter --> Events
    EventRouter --> Student
    EventRouter --> Organizer
    StudentRouter --> Student
    StudentRouter --> Events
    OrganizerRouter --> Organizer
    AdminRouter --> Admin
    AdminRouter --> Events
```

### Frontend component tree

```mermaid
flowchart TB
    Root["main.jsx<br/>RecoilRoot → MotionConfig → BrowserRouter"] --> RL["RootLayout<br/>Header (ThemeToggle) · Sidebar · Outlet · Footer · ToastContainer"]

    RL --> Pub["Public"]
    Pub --> LP[LandingPage]
    Pub --> SU["SignUp<br/>(role toggle, Cloudinary logo upload)"]
    Pub --> SI["SignIn<br/>(role select → JWT → Recoil)"]
    Pub --> VP["VerifyPage<br/>/verifyPage/:role/:id/:token"]

    RL --> SP["/student-profile/:emailId"]
    SP --> SH["Home<br/>Dock tabs → Events · Enrolled · My Calendar · Calendar · Gallery · Dashboard"]
    SP --> SD["StudentDashBoard<br/>profile + edit + rewards"]
    SP --> EE[EnrolledEvents]
    SP --> EV[Events]
    SP --> EB["EventsById<br/>details · enroll · comments"]
    SP --> CC["Customcalender (all events)<br/>→ CalendarView"]
    SP --> SC["StudentCalender (enrolled)<br/>→ CalendarView"]
    SP --> GH["GalleryHomePage (clubs)"]
    SP --> CE["ClubEvents/:clubById"]

    RL --> OP["/organizer-profile/:emailId"]
    OP --> OH["Home<br/>Dock tabs → Events · Post Event · Created · Calendar · Dashboard"]
    OP --> OD["OrganizerDashBoard<br/>profile + stats"]
    OP --> PE["PostEvent<br/>form + uploads + confetti"]
    OP --> CR[CreatedEvents]
    OP --> EB2["EventsById<br/>edit · delete"]
    OP --> EP["EventParticipants<br/>Excel / PDF export"]
    OP --> OC["OrganiserCalender<br/>→ CalendarView"]
    OP --> FE[FetchEvents]

    RL --> AP["/admin-profile/:emailId"]
    AP --> AD["AdminDashBoard<br/>shortcut cards"]
    AP --> ME["ManageEvents<br/>(coming soon)"]
    AP --> EV3[Events]
    AP --> EB3[EventsById]
```

### Sequence diagrams

#### 1. Signup and email verification

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant C as React Client
    participant CL as Cloudinary
    participant A as /auth router
    participant Z as Zod
    participant DB as MongoDB
    participant M as Nodemailer → Gmail

    U->>C: Fill signup form (role = student | organizer)
    opt Organizer
        C->>CL: POST /upload (logo, upload_preset)
        CL-->>C: secure_url
    end
    C->>A: POST /auth/{role}/signUp
    A->>Z: safeParse(body)
    alt invalid
        A-->>C: 411 Invalid data
    else valid
        A->>A: bcrypt.hash(password)
        A->>DB: save Student / Organizer (verified=false)
        A->>DB: save Token {userId, randomBytes(32)} (TTL 1h)
        A->>M: send BASE_URL/verifyPage/{role}/{id}/{token}
        A-->>C: 200 "Verification email sent"
    end

    U->>C: Click link in inbox → /verifyPage/:role/:id/:token
    C->>A: GET /auth/{role}/:id/verify{Role}/:token
    A->>DB: find user + matching token
    alt token found
        A->>DB: set verified=true, delete token
        A-->>C: 200 verified
        C->>U: redirect to /signin
    else missing / expired
        A-->>C: 400 invalid link
    end
```

#### 2. Sign-in and authorised request

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant C as React Client
    participant R as Recoil + localStorage
    participant A as /auth or /admin
    participant P as Protected router
    participant V as verifyUser
    participant G as Role guard
    participant DB as MongoDB

    U->>C: email, password, role
    C->>A: POST signin
    A->>DB: findOne({email})
    A->>A: bcrypt.compare
    alt not verified (student/organizer)
        A->>DB: create token if none
        A-->>C: 400 "verification email sent"
    else ok
        A->>A: jwt.sign({userId}, JWT_SECRET)
        A-->>C: 200 {token, payload}
        C->>R: localStorage.token = JWT; userAtom = {username, role, email, _id, isLoggedIn}
        C->>U: navigate to /{role}-profile/{username}
    end

    C->>P: GET/PUT … Authorization: JWT
    P->>V: verify(JWT)
    V-->>P: req.userId
    P->>G: findById(req.userId) in Organizer/Admin
    G-->>P: next() if found
    P->>DB: query / mutate
    P-->>C: 200 payload
```

#### 3. Organizer creates an event

```mermaid
sequenceDiagram
    autonumber
    actor O as Organizer
    participant C as PostEvent.jsx
    participant CL as Cloudinary
    participant E as /event router
    participant DB as MongoDB

    O->>C: Fill form + FAQs + image + certificate
    C->>CL: upload eventImage
    CL-->>C: url
    C->>CL: upload sampleCertificate
    CL-->>C: url
    C->>E: POST /event/app/v1/create (JWT)
    E->>E: verifyUser → validPerson (is Organizer?)
    E->>DB: Events.create({..., organiser: req.userId, isApproved:false})
    DB-->>E: event
    E-->>C: 200 created
    C->>O: Confetti + toast
```

#### 4. Student enrolls in an event

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    participant C as EventsById.jsx
    participant E as /event router
    participant DB as MongoDB

    S->>C: Click "Enroll"
    C->>E: PUT /event/app/v1/update/student/:eventId {enroll:true, name, rewardPoints}
    E->>DB: Events.findById
    alt already in enrolledStudents
        E-->>C: 400 already enrolled
    else
        E->>DB: event.enrolledStudents.push({studentId,name}); enrolled += 1; save
        E->>DB: student.eventsEnrolled.push(eventId); rewardsEarned += rewardPoints; save
        E-->>C: 200 Enrolled successfully
        C->>S: enrolled state + "spots filled" bar updated
    end
```

> Note: the server doesn't check `maxLimit` or `registrationEndDate` here. The card's open/closed badge is computed on the client only.

#### 5. Organizer exports participants

```mermaid
sequenceDiagram
    autonumber
    actor O as Organizer
    participant C as EventParticipants.jsx
    participant E as /event router
    participant DB as MongoDB

    C->>E: GET /event/app/v1/organiser/events (JWT)
    E->>DB: Events.find({organiser: userId})
    E-->>C: my events
    O->>C: Select event
    C->>E: GET /event/students/enroll/:eventId
    E->>DB: Student.find({eventsEnrolled: eventId}).select('-password')
    E-->>C: students[]
    alt Export Excel
        C->>C: XLSX.utils.json_to_sheet → XLSX.write → download .xlsx
    else Export PDF
        C->>C: new jsPDF() + autoTable → save .pdf
    end
```

#### 6. Comment lifecycle and moderation

```mermaid
sequenceDiagram
    autonumber
    actor S as Student
    actor A as Admin
    participant E as /event router
    participant AD as /admin router
    participant DB as MongoDB

    S->>E: PUT app/v1/update/student/:eventId {content, name}
    E->>DB: event.comments.push({content, owner, name})
    S->>E: PUT app/v1/comment/update/:eventId/:commentId {text}
    E->>E: check comment.owner == req.userId
    E->>DB: update content
    S->>E: DELETE app/v1/comment/delete/:eventId/:commentId
    E->>E: check owner
    E->>DB: splice comment

    A->>AD: PUT /admin/event/comment/:eventId/:commentId
    AD->>AD: verifyUser → validAdmin
    AD->>DB: splice comment (any owner)
```

#### 7. Page refresh and logout (session on the client)

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant B as Browser
    participant LS as localStorage
    participant R as Recoil (userAtom)
    participant H as Header.jsx

    U->>B: Refresh any page
    B->>LS: recoil-persist reads saved userAtom
    LS-->>R: {username, role, isLoggedIn: true, ...}
    Note over R: UI renders as logged in. API calls reuse localStorage.token
    alt token expired (organizer, after 1h)
        B-->>U: API returns 401 "Invalid or expired token" → sign in again
    end
    U->>H: Click "Log Out"
    H->>R: resetUser() → default (isLoggedIn: false)
    H->>LS: removeItem('token')
    H->>B: navigate('/')
```

#### 8. Theme toggle

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant T as ThemeToggle
    participant H as useTheme
    participant A as themeAtom (persisted)
    participant D as document (html)

    U->>T: Click sun/moon
    T->>H: toggleTheme()
    alt View Transitions API available
        H->>D: startViewTransition → circular reveal
    end
    H->>A: set 'light' | 'dark'
    H->>D: html.classList = light | dark
    Note over D: CSS variables swap → every Tailwind colour updates
    Note over U,D: Next load: inline script in index.html applies the saved theme before React paints
```

### Auth and verification state machine

```mermaid
stateDiagram-v2
    [*] --> Registered: POST signUp
    Registered --> PendingVerification: token saved + email sent
    PendingVerification --> Verified: valid link clicked (< 1h)
    PendingVerification --> TokenExpired: 1h TTL elapses
    TokenExpired --> PendingVerification: sign-in attempt re-issues token
    PendingVerification --> PendingVerification: sign-in attempt (blocked)
    Verified --> Authenticated: sign-in → JWT issued
    Authenticated --> Verified: logout (token removed)
    Authenticated --> Verified: JWT expired (organizer 1h)
```

### Event lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Organizer submits form
    Draft --> Pending: saved (isApproved=false)
    Pending --> Approved: Admin PUT isApproved=true
    Pending --> Pending: Organizer edits
    Approved --> RegistrationOpen: now < registrationEndDate
    RegistrationOpen --> RegistrationClosed: registrationEndDate passed / maxLimit reached
    RegistrationClosed --> Ongoing: startDate
    Ongoing --> Completed: endDate
    Pending --> Deleted: Organizer deletes
    Approved --> Deleted: Organizer deletes
    Completed --> [*]
    Deleted --> [*]
```

---

## API Reference

Base URL: `http://localhost:<port>`. 🔒 means the route needs the header `Authorization: <JWT>` (the raw token, no `Bearer` prefix).

### `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/student/signUp` | – | Register a student, then send the verification email |
| POST | `/auth/student/signin` | – | Student login, returns JWT |
| GET | `/auth/student/:id/verifyStudent/:token` | – | Verify student email |
| POST | `/auth/organizer/signUp` | – | Register an organizer (with logo URL), then send the verification email |
| POST | `/auth/organizer/signin` | – | Organizer login, returns a JWT (1h expiry) |
| GET | `/auth/organizer/:id/verifyOrganizer/:token` | – | Verify organizer email |

### `/event`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/event/app/v1/create` | 🔒 Organizer | Create an event |
| GET | `/event/app/v1/events` | 🔒 | List all events |
| GET | `/event/app/v1/events/:eventId` | 🔒 | Event details plus an `isEnrolled` flag for the caller |
| GET | `/event/app/v1/organiser/events` | 🔒 Organizer | Events created by the caller |
| GET | `/event/app/v1/events/details/:organiserId` | 🔒 | Events created by a given organizer (club page) |
| POST | `/event/app/v1/event/update/:eventId` | 🔒 Organizer (owner) | Update an event |
| DELETE | `/event/app/v1/event/delete/:eventId` | 🔒 Organizer (owner) | Delete an event |
| PUT | `/event/app/v1/update/student/:eventId` | 🔒 | `{enroll:true,name,rewardPoints}` enrolls; `{content,name}` adds a comment |
| PUT | `/event/app/v1/comment/update/:eventId/:commentId` | 🔒 Owner | Edit your own comment `{text}` |
| DELETE | `/event/app/v1/comment/delete/:eventId/:commentId` | 🔒 Owner | Delete your own comment |
| GET | `/event/students/enroll/:eventId` | 🔒 Organizer | Students enrolled in an event (password excluded) |

### `/student`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/student/getdetails` | 🔒 | Caller's profile |
| GET | `/student/enrolledEvents` | 🔒 | Events the caller is enrolled in |
| PUT | `/student/update/profiledetails` | 🔒 | Update profile |
| PUT | `/student/comment/:eventId` | 🔒 | Add a comment |
| PUT | `/student/comment/:eventId/:commentId` | 🔒 Owner | Delete your own comment |

### `/organiser`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/organiser/getdetails` | 🔒 | Caller's organizer profile |
| PUT | `/organiser/update/profiledetails` | 🔒 | Update profile |
| GET | `/organiser/get/organiserDetails` | – | All organizers/clubs (used by the gallery) |

### `/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/admin/signUp` | – | Create an admin |
| POST | `/admin/signin` | – | Admin login, returns JWT |
| PUT | `/admin/app/v1/event/update/:eventId` | 🔒 Admin | Approve or update any event (e.g. `{isApproved:true}`) |
| PUT | `/admin/event/comment/:eventId/:commentId` | 🔒 Admin | Delete any comment |

---

## Frontend Routes

| Path | Component | Role |
|---|---|---|
| `/` | LandingPage | Public |
| `/signup` | SignUp | Public |
| `/signin` | SignIn | Public |
| `/verifyPage/:role/:id/:token` | VerifyPage | Public |
| `/student-profile/:emailId` | Home | Student |
| `…/dashboard` | StudentDashBoard | Student |
| `…/events` | Events | Student |
| `…/viewevent/:eventById` | EventsById | Student |
| `…/enrolledevents` | EnrolledEvents | Student |
| `…/calender` | Customcalender | Student |
| `…/studentCalender` | StudentCalender | Student |
| `…/galleryPage` | GalleryHomePage | Student |
| `…/club/:clubById` | ClubEvents | Student |
| `/organizer-profile/:emailId` | Home | Organizer |
| `…/dashboard` | OrganizerDashBoard | Organizer |
| `…/events` | Events | Organizer |
| `…/viewevent/:eventById` | EventsById | Organizer |
| `…/postEvents` | PostEvent | Organizer |
| `…/createdEvents` | CreatedEvents | Organizer |
| `…/eventDetails` | EventParticipants | Organizer |
| `…/view/calender` | Customcalender | Organizer |
| `…/view/organisercalender` | OrganiserCalender | Organizer |
| `…/getevents` | FetchEvents | Organizer |
| `/admin-profile/:emailId` | AdminDashBoard (index) | Admin |
| `…/dashboard` | AdminDashBoard | Admin |
| `…/manageEvents` | ManageEvents | Admin |
| `…/events` | Events | Admin |
| `…/viewevent/:eventById` | EventsById | Admin |

---

## Validation Rules

Enforced on the server with Zod:

- **Username**: 3–30 characters.
- **Password**: at least 8 characters, with at least one letter, at least one digit (1–9), and an `@` that is not the first character.
- **Email**: valid email format.
- **Student**: `phoneNumber` and `year` must be numbers.
- **Organizer**: `phoneNumber` is coerced to a number; `clubName`, `position`, and `logo` are required.
- **Event** (schema defined in `validEventData`, **not yet attached** to `POST /event/app/v1/create`): name, description, category, venue, venueAddress, keyTakeAways, registrationForm, and endTime are strings; maxLimit, registrationFee, and rewardPoints are numbers; dates are coerced; each FAQ needs a non-empty question and answer.
- **Client side**: React Hook Form validates the same fields in the forms before sending.

Uniqueness is enforced by MongoDB indexes: username, email, and phone number per role, club name, and event name.

---

## How to Add a Feature

### A. New API endpoint
1. Pick the router in `Server/apis/` that owns the resource (events → `Event.js`, student profile → `User.js`, ...).
2. Add the handler with the same shape as the others:
   ```js
   eventApp.get('/app/v1/events/:eventId/summary', verifyUser, async (req, res) => {
     try {
       const event = await Events.findById(req.params.eventId);
       if (!event) return res.status(404).json({ message: 'Event not found' });
       res.status(200).json({ message: 'ok', payload: { name: event.eventName, enrolled: event.enrolled } });
     } catch (e) {
       console.error(e);
       res.status(500).json({ message: 'Something went wrong' });
     }
   });
   ```
3. Add `validPerson` (organizer only) or `validAdmin` after `verifyUser` if the route is role-restricted. Add a Zod validator for request bodies.
4. If you add a field, update the Mongoose schema in `Server/models/`.
5. Responses always look like `{ message, payload }`. Keep that so the client code stays uniform.
6. Add a row to the [API Reference](#api-reference).

### B. New page
1. Create the component in `components/students/`, `components/organizer/` or `components/common/`.
2. Wrap it in the shared UI kit so it matches the rest of the app:
   ```jsx
   import { Page, PageHeader, Spinner, EmptyState } from '../ui/Page';

   function MyPage() {
     return (
       <Page>
         <PageHeader title="My Page" subtitle="One line about it" />
         {/* loading ? <Spinner/> : items.length ? <grid/> : <EmptyState/> */}
       </Page>
     );
   }
   ```
3. Call the API with `` `${import.meta.env.VITE_API_URL}/...` `` and `headers: { Authorization: localStorage.getItem('token') }`.
4. Register the route in `Client/src/main.jsx` under the right role (`student-profile/:emailId`, ...).
5. Optionally add a sidebar link (`common/Sidebar.jsx`, the `links` array) and/or a Home Dock tab (`common/Home.jsx`, the `tabs` array: `{ id, label, icon, roles }` plus a render line).

### C. Styling rules
- Use `text-white`, `bg-white/10`, `text-neutral-400`, `border-white/10`, ... They flip automatically in light mode. Avoid raw hex colours and `gray-*` classes; they don't follow the theme.
- Reuse `.glass`, `.field`, `.btn-primary`, `.btn-ghost`, `.chip` from `index.css`.
- Keep animation simple: one-time entrances and small hovers (see [Animation](#animation)).

---

## Development Workflow & Checks

### Git
- Pull before you start: `git pull`.
- Work on a branch: `git checkout -b feature/short-name`, then open a pull request into `main`.
- **Resolve merge conflicts file by file.** Never "accept all theirs/ours" blindly. A bad conflict resolution once broke the build: `Events.jsx` got an old opening tag with a new closing tag, `Footer.jsx` lost its imports, and the header and layout reverted (see `plan.md`, Phase 10).
- Never commit `.env`, `node_modules`, or `dist`.

### Checks before you push (from `Client/`)
| Check | Command | Catches |
|---|---|---|
| Lint (uses the project config) | `npx eslint src` | Undefined variables, missing imports, unused code, hook mistakes. The project is at **0 errors**: keep it there (the 5 `react-refresh` warnings are harmless) |
| Production build | `npm run build` | JSX syntax errors, bad imports |
| Quick syntax check of one file | `npx esbuild src/components/common/Events.jsx --loader:.js=jsx` | Mismatched tags |

> Run ESLint with the project config (plain `npx eslint src`). With `--no-config-lookup` it silently skips `.jsx` files and reports nothing.

Then test in the browser: sign up, verify, sign in, and the page you changed, in **both themes** and at **phone width**.

### Logging changes
Add a short entry to `plan.md` for every change: what, which files, how it was checked.

---

## Deployment

| Part | Where | Notes |
|---|---|---|
| Client | Vercel (`Client/vercel.json` rewrites every path to `/` so React Router handles deep links) | Set `VITE_API_URL`, `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET` in the Vercel project settings. Build command `npm run build`, output `dist` |
| Server | Any Node host (Render, Railway, ...) | Start command `npm start`. Set every `Server/.env` key. Set `BASE_URL` to the deployed client URL so verification links work |
| Database | MongoDB Atlas | Allow the server's IP in Network Access |

After deploying the server, update `VITE_API_URL` on Vercel and redeploy the client. Vite bakes env values in at build time.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Network calls go to `undefined/event/...` | `Client/.env` missing `VITE_API_URL`, or Vite not restarted | Add it, restart `npm run dev` |
| **CORS error** on sign in/up | The client points at a port where something else is running (port 3000 is often Docker/WSL) | Make sure `VITE_API_URL` points at the Express port (4000) and the server is running |
| No verification email | Wrong `USER`/`PASS`, or `PASS` isn't an App Password; mail in spam | At startup the server prints `Mailer ready: ...` or `Mailer NOT ready — ...` with the reason. Fix `.env`, restart, then sign in to get a new link |
| Verification link says "invalid link" | Token older than 1 hour (deleted by TTL) or already used | Sign in again: a new link is emailed |
| Sign in says "Please verify your email first" | Account not verified yet | A new link is emailed on every such sign-in attempt. Click it |
| Sign up says "An account with this email already exists" | You registered earlier (maybe the email failed) | Sign in instead: it re-sends the verification link |
| Organizer suddenly gets 401 | Organizer JWT expires after 1 hour | Log out and sign in |
| Images don't upload | `VITE_CLOUDINARY_*` missing, or the preset is "Signed" | Set both variables; make the preset Unsigned |
| `database is successfully connected` never prints | Wrong `DB_URL`, or Atlas IP not allowed | Check the string and Atlas Network Access |
| Refreshing a deep link on Vercel gives 404 | Missing SPA rewrite | Keep `Client/vercel.json` |
| Content hidden under the header, or the sidebar overlaps | `RootLayout.jsx` changed | Content needs `pt-24` and `md:ml-64` / `md:ml-24` |
| `X is not defined` in the browser console | Missing import (often after a merge) | `npx eslint src` points to the line |

---

## Known Issues & Limitations

- **Event validation**: `validEventData` (Zod) exists in `Event.js` but isn't attached to the create route.
- **Admin UI**: the admin dashboard shows shortcut cards, and `ManageEvents` is a "coming soon" page. Event approval and comment moderation are available only through the API.
- **Theme transition**: the circular reveal needs the View Transitions API (Chrome/Edge). Other browsers switch themes instantly.
- **Approval is not enforced**: events are listed whether or not `isApproved` is set.
- **Student / admin JWTs never expire**. Only organizer tokens have `expiresIn: 1h`.
- Enrollment does not check `maxLimit` or `registrationEndDate` on the server.
- No pagination, search, rate limiting, caching, or automated tests yet.
- `Client/src/routes.jsx` and `LandingPageLayout.jsx` are unused. The live routes are in `main.jsx`.
- The URL param is named `:emailId` but holds the username.

---

## Future Improvements

- Admin UI for approvals, moderation, and analytics (the dashboard shortcuts are already in place).
- Show only approved events to students, and enforce seat and deadline limits on the server.
- Central Axios instance with base URL and interceptors (auth header, 401 → logout).
- Refresh tokens and consistent JWT expiry across roles.
- Pagination, search, and category filters for events.
- Email notifications for enrollment confirmations and event reminders.
- Certificates generated automatically after event completion.
- Leaderboard based on reward points.
- Rate limiting (`express-rate-limit`), Helmet, and a stricter CORS origin.
- Unit and integration tests (Jest + Supertest), plus CI.
- Docker Compose for one-command local setup.

---

## Learning Path for New Contributors

Read the code in this order. Each step builds on the previous one.

| Day | Read | Goal |
|---|---|---|
| 1 | This README (Part A), then `plan.md` | Know what the app does and why it looks the way it does |
| 1 | `Server/server.js` → `middlewares/verifyUser.js` → `models/*.js` | Understand the API bootstrap, auth, and data shape |
| 2 | `Server/apis/Auth.js` | Signup, email verification, sign-in, JWT |
| 2 | `Server/apis/Event.js` | Event CRUD, enrollment, comments, role guard |
| 3 | `Client/src/main.jsx` → `RootLayout.jsx` → `UserAtom.js` | Routing, layout, session state |
| 3 | `common/SignIn.jsx`, `SignUp.jsx`, `VerifyPage.jsx` | The client side of auth, Cloudinary logo upload |
| 4 | `common/Home.jsx` → `ui/Dock.jsx` → `common/Events.jsx` → `ui/EventCard.jsx` | How pages are composed from the shared UI kit |
| 4 | `common/EventsById.jsx` | The biggest page: details, enroll, comments, edit/delete |
| 5 | `organizer/PostEvent.jsx`, `EventParticipants.jsx` | Forms with uploads, Excel/PDF export |
| 5 | `index.css`, `tailwind.config.js`, `theme/useTheme.js` | Theming with CSS variables |

### Starter tasks (good first issues)
1. Attach `validEventData` to `POST /event/app/v1/create` (check the client sends numbers, not strings).
2. Check `maxLimit` and `registrationEndDate` on the server when enrolling.
3. Check that an organizer owns the event in `GET /event/students/enroll/:eventId`.
4. Create a shared Axios instance (`baseURL: import.meta.env.VITE_API_URL`, auth header interceptor).

---

## Credits

- **Vinay Kumar Peddaboina**: original author. Repository: [github.com/Vinaykumarp2005/Event-Connect](https://github.com/Vinaykumarp2005/Event-Connect)
- **Cleancode16**: UI redesign (themes, glass design, Dock), documentation

Contributions are welcome. Fork the repo, work on a branch, and open a pull request.
