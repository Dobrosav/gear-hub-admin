# GearHubAdmin — ETF Equipment Rental Admin Panel

Web administration application for managing technical equipment rentals, reservations, return inspections, and issue reports at the School of Electrical Engineering (ETF), University of Belgrade.

Built with **Angular 22** and **TypeScript**, using `localStorage` persistence seeded from local JSON datasets (`src/app/data/*.json`).

---

## Features

- **Administrator Authentication** (`/login`): Role-restricted sign-in (`ADMIN` role only) with validation and error feedback, plus session persistence in `localStorage`.
- **Dashboard** (`/dashboard`): KPI overview (total equipment, active rentals, items in maintenance, open issues) and recent activity table.
- **Equipment Catalog** (`/equipment`, `/equipment/new`, `/equipment/:id/edit`):
  - Browse all equipment with thumbnails, inventory codes, hourly rates, and availability status.
  - Add new equipment with Base64 photo preview and required-field validation.
  - Edit existing equipment details, photo, and status (`AVAILABLE`, `RENTED`, `MAINTENANCE`, `DISABLED`).
- **Rentals & Return Inspection** (`/rentals`, `/rentals/:id`):
  - View all active, reserved, and completed rentals with pricing.
  - Inspect return photos and either confirm proper condition or send equipment to maintenance.
- **Occupancy Calendar** (`/calendar`): Weekly equipment reservation matrix with previous/next week navigation and clickable booking slots.
- **Issue Reports** (`/issues`, `/issues/:id`): Review user-submitted issue descriptions and damage photos, then decide whether to send equipment to maintenance, temporarily disable it, or keep it available.
- **Admin Profile** (`/profile`): Update personal details and change password with current-password verification.

---

## Default Admin Accounts

Initial accounts are seeded from `src/app/data/users.json`:

| Username | Password | Role |
| :--- | :--- | :--- |
| `admin` | `Admin1234!` | `ADMIN` |
| `admin_jelica` | `Admin123!` | `ADMIN` |

> **Note:** If you previously ran the app with older seed data, run `localStorage.clear()` in the browser DevTools console to re-seed from `src/app/data/*.json`.

---

## Getting Started

### Prerequisites
- Node.js & npm

### Development Server
```bash
npm install
npm start
```
Open `http://localhost:4200/` in your browser.

### Production Build
```bash
npm run build
```
Build artifacts are output to `dist/gear-hub-admin/`.

### Unit Tests (Vitest)
```bash
npm test -- --watch=false
```
Unit tests cover `App`, `DataService` (`src/app/services/data.service.spec.ts`), and `AuthService` (`src/app/services/auth.service.spec.ts`).

### End-to-End Flow (Selenium IDE)
Import `gear-hub-admin.side` into the **Selenium IDE** browser extension while the dev server is running on `http://localhost:4200` to execute the full 45-step admin walkthrough.

---

## Project Structure

```text
├── assets/images/             # Equipment, issue, and return photos
├── gear-hub-admin.side        # Selenium IDE end-to-end test suite
└── src/app/
    ├── components/            # Standalone Angular UI components
    ├── data/                  # Initial JSON seed files (equipment, users, rentals, issues)
    ├── models/                # TypeScript interfaces and status types
    └── services/              # AuthService and DataService (localStorage persistence)
```
