<div align="center">
  <img src="public/logo-light.png" alt="D Tracker Logo" width="120" />

  # D Tracker

  **A Premium, Offline-First Habit & Task Tracking Application.**

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?logo=framer)](https://www.framer.com/motion/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

  [Live Demo](https://tracker-ap.vercel.app/) (Coming Soon) • [Report Bug](https://github.com/kirankumar3117/tracker-frontend/issues) • [Request Feature](https://github.com/kirankumar3117/tracker-frontend/issues)

  <br />
</div>

## 🌟 Overview

**D Tracker** is a masterclass in modern, minimalist web application design. Built from the ground up to be an **Offline-First**, lightning-fast PWA, it allows users to track their daily developer habits (like DSA problem solving, Open Source PR reviews, and deep work) completely locally without ever needing to create an account. 

If users want to sync their data across devices, a beautiful Framer Motion-powered cloud conversion flow bridges the gap perfectly to our backend.

---

## 🎨 Key Features

- **Premium Bento-Box UI**: A highly polished, custom-designed interface utilizing complex CSS grids to create stunning "Bento Box" layouts in both Light and Dark modes.
- **Offline-First Architecture**: Features a robust, SSR-safe `useLocalStorage` React hook that instantly saves all grid interactions directly to your device.
- **Matrix Grid System**: A powerful Excel-style horizontal scrolling matrix for marking daily completion, complete with smart timeline bounding and weekly frequency constraints (e.g., track a habit only on Mon/Wed/Fri).
- **Advanced Visual Analytics**: Integrated `Recharts` for rich, interactive volume and consistency charts that dynamically adapt to your selected theme.
- **Butter-Smooth Animations**: Extensively uses `framer-motion` for spring-physics modals, layout transitions, and interactive checkboxes.
- **Interactive Guided Tour**: Features a built-in `driver.js` tour to fluidly onboard new users through the application's unique features.

---

## 🚀 Version 1 — Feature Changelog

> **Shipped:** March 2026 · Commit `dd59b6a`

### 🔐 Authentication
| Feature | Details |
|---|---|
| **Email / Password Auth** | Full login & registration flow with field validation and error display |
| **Google OAuth (SSO)** | One-click sign-in via `@react-oauth/google` connected to `/auth/google` backend |
| **Zustand Auth Store** | Centralized reactive auth state using Zustand `persist` middleware — replaces scattered `localStorage` and `window` event hacks |
| **Persistent Sessions** | Token stored in HTTP-only cookie + `localStorage` for immediate client-side usage |
| **401 Interceptor** | Axios response interceptor auto-clears session and calls `logout()` on token expiry |
| **Google-account Error Handling** | Backend `400` error for password-login on a Google account is caught and displayed with premium red toast styling |

---

### 📅 Habit Matrix
| Feature | Details |
|---|---|
| **Frequency-aware rendering** | Habits scheduled only on certain days of the week render inactive (greyed-out) cells on off-days |
| **Duration boundaries** | Supports `all-time`, `1-week`, and `custom date range` habit durations |
| **Future Date Protection** | Clicking a future date is blocked and triggers a humorous Framer Motion "Time Traveler" toast |
| **Optimistic UI updates** | Log toggles apply instantly to local state with `pendingLogs` diff tracking before bulk API save |
| **Month/Year navigator** | Dropdown controls to switch between any month/year with auto-scroll to today |

---

### 📊 Dashboard & Analytics
| Feature | Details |
|---|---|
| **Accurate Today % Progress** | Dashboard completion ring now excludes habits inactive today (respects frequency + duration) |
| **Volume Overview Chart** | Bar chart showing daily completed habit count for the past 14 days |
| **Consistency Trend Chart** | Line chart showing daily completion rate (%) for the past 14 days |
| **Dynamic Date Range Labels** | Chart headers show live date range (e.g., "Showing past 14 days (Feb 18 – Mar 04)") |
| **Consistency Leaderboard** | Habits ranked by monthly performance, dynamically calculated per active days |
| **Mock Data Mode indicator** | "Mock Data Mode" badge in the header only shown when user is not logged in |

---

### 🏗️ Architecture & DX
| Feature | Details |
|---|---|
| **Feature-based folder structure** | Components split into `features/habits/`, `components/layout/`, `store/`, `lib/api/` |
| **Centralized Axios instance** | Single API client with request auth-header injection and structured error unwrapping |
| **Bulk Log Save** | All pending habit log changes batched into a single `POST /logs/bulk` call on save |
| **Zustand store** | `useAuthStore` provides `login` / `logout` actions consumed across Header, Sidebar, Modal, and Dashboard hooks |
| **`@react-oauth/google` integration** | `GoogleOAuthProvider` wraps the app at the root `Providers.tsx` level |

---

## 🏗️ Architecture & Ecosystem

This repository (`tracker-frontend`) represents the client-side Next.js Application. 

To enable "Sync to Cloud" functionality, authentication, and cross-device persistence, pair this frontend with the official backend database API:

🔗 **Backend Repository**: [kirankumar3117/tracker-backend](https://github.com/kirankumar3117/tracker-backend)

---

## 🛠️ Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Components**: [Radix UI](https://www.radix-ui.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Onboarding**: [Driver.js](https://driverjs.com/)

---

## 🚀 Getting Started

To get a local development environment up and running, follow these simple steps.

### Prerequisites

* Node.js (v18.17.0 or higher recommended)
* npm or yarn

### Installation

1. Clone the frontend repository
   ```sh
   git clone https://github.com/kirankumar3117/tracker-frontend.git
   ```
2. Navigate into the directory
   ```sh
   cd tracker-frontend
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Start the development server
   ```sh
   npm run dev
   ```
5. Open `http://localhost:3000` in your browser.

*(Note: The application will run perfectly fine on purely local mock-data without the backend running).*

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <i>Built with passion by <a href="https://github.com/kirankumar3117">Kiran Kumar</a></i>
</div>
