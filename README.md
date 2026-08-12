# NotifyHub 📢

**NotifyHub** is a comprehensive, modern Campus Announcement and Event Notification Platform built for educational institutions. It provides a dual-dashboard system (Student Dashboard & Admin Management System) featuring real-time notifications, filtered announcements, campus events, query resolution, audit logging, and responsive theme support.

---

## 🛠️ Technology Stack & Technologies Used

NotifyHub is engineered as a decoupled, full-stack web application with a modern React SPA frontend and a layered Express REST API backend connected to a serverless PostgreSQL database.

| Domain | Technology / Tool | Version / Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **React** | v19.2.8 |
| **Build Tool & Dev Server** | **Vite** | v8.2.0 |
| **Client-Side Routing** | **React Router DOM** | v7.18.2 |
| **Frontend Styling** | **Vanilla CSS** | Modern CSS Variables, Glassmorphism, Mobile Responsive Layouts |
| **Backend Runtime** | **Node.js** | ES Modules (`"type": "module"`) |
| **Backend Server** | **Express.js** | v5.2.1 |
| **Database ORM** | **Prisma ORM** | v6.19.3 |
| **Database** | **PostgreSQL** | Serverless PostgreSQL via **Neon Database** |
| **Authentication** | **JWT & Cookies** | `jsonwebtoken` (v9) with `cookie-parser` (v1.4) (HTTP-only SameSite cookies) |
| **Password Security** | **Bcrypt** | v6.0.0 (salted password hashing) |
| **File Uploads** | **Multer** | v2.2.0 + Base64 Database Storage |
| **Linting & Quality** | **Oxlint** | v1.75.0 |

---

## 🎨 Frontend Design & Architecture

The frontend is built as a single-page application (SPA) focused on visual excellence, performance, and responsive user experience across desktop and mobile devices.

### Key Frontend Capabilities
* **Framework & Build System**: Uses **React 19** paired with **Vite 8** for instant HMR and optimized production builds.
* **Declarative Routing**: Managed via `react-router-dom` (v7) with role-aware route guards (`ProtectedRoute.jsx`) that restrict pages based on user roles (`STUDENT` vs `ADMIN`).
* **Design System & Styling**:
  * **Vanilla CSS Architecture**: Structured into global tokens (`index.css`), mobile adaptations (`mobile.css`), layout stylesheets, and component-scoped CSS.
  * **Glassmorphism & Theme Switching**: Dynamic Light/Dark mode toggling managed through `ThemeContext.jsx` with CSS root variables.
* **API Integration Layer**:
  * Centralized fetch abstraction (`src/services/api.js`) utilizing `credentials: 'include'` to pass HTTP-only authentication cookies automatically across requests.
* **Component Hierarchy & Layouts**:
  * **Admin Layout (`AdminLayout.jsx`)**: Sidebar navigation, header controls, activity logs access, query counters, and urgent dropdown alerts.
  * **Student Layout (`StudentLayout.jsx`)**: Header navigation bar, notification dropdowns, urgent alerts modal, and calendar view.

---

## 💾 Database Architecture & Models

The database tier runs on **Neon PostgreSQL** managed via **Prisma ORM (v6)**.

### Database Provider Configuration
* **Database Engine**: Serverless PostgreSQL
* **ORM Provider**: Prisma Client (`prisma-client-js`) with schema migrations (`npx prisma migrate dev`), database push (`npx prisma db push`), and schema studio (`npx prisma studio`).

### Data Models & Schema (`server/prisma/schema.prisma`)

```
 ┌──────────────┐       1:N       ┌──────────────────┐
 │     User     ├─────────────────►   Announcement   │
 └──────┬───────┘                 └──────────────────┘
        │
        │ 1:N                     ┌──────────────────┐
        ├─────────────────────────►      Event       │
        │                         └──────────────────┘
        │
        │ 1:N (Student/Responder) ┌──────────────────┐
        ├─────────────────────────►      Query       │
        │                         └──────────────────┘
        │
        │ 1:N                     ┌──────────────────┐
        ├─────────────────────────►   Notification   │
        │                         └──────────────────┘
        │
        │ 1:N                     ┌──────────────────┐
        └─────────────────────────►   ActivityLog    │
                                  └──────────────────┘
```

#### Enums
* `UserRole`: `STUDENT`, `ADMIN`
* `AnnouncementCategory`: `ACADEMIC`, `EXAM`, `PLACEMENT`, `WORKSHOP`, `EVENT`, `GENERAL`
* `AnnouncementPriority`: `NORMAL`, `IMPORTANT`, `URGENT`
* `AnnouncementStatus`: `DRAFT`, `PUBLISHED`, `ARCHIVED`
* `QueryStatus`: `OPEN`, `IN_PROGRESS`, `RESOLVED`

#### Core Entities
1. **`User`**: Stores credentials (`email`, `passwordHash`), profile data (`name`, `rollNo`, `year`, `department`), and role assigned.
2. **`Announcement`**: Stores title, description, category, priority, status, target department/year, published date, and attachment details (base64 string stored in `attachmentData` for database file hosting).
3. **`Event`**: Stores campus event details including timing, venue, organizer info, registration status, deadlines, and attachments.
4. **`Query`**: Student support tickets enabling direct student-to-admin communication with status tracking and soft-deletion options.
5. **`Notification`**: Real-time/polled user alerts generated for urgent announcements, events, and query updates.
6. **`ActivityLog`**: Comprehensive audit log recording actions executed by administrators for transparency.

---

## ⚙️ Backend Design & Implementation

The backend follows a **Layered RESTful Architecture** built on Express 5 and Node.js ES Modules.

### 1. Modular Directory Structure
* `server/src/app.js`: Express application initialization, CORS configuration, HTTP cookie middleware, static upload directory serving, and global error handling.
* `server/src/routes/`: Isolated controller modules for each resource:
  * `/api/auth`: User registration, login, logout (`HTTP-only` cookie handling), current user context.
  * `/api/announcements`: CRUD, filtering by department/year, priority, status updates, base64 file attachment handling.
  * `/api/events`: Event creation, listing, updating, registration status management.
  * `/api/queries`: Student query creation, status updates (OPEN/RESOLVED), responses, role-based soft deletion.
  * `/api/notifications`: User notification fetching, mark-as-read, unread count tracking.
  * `/api/activity`: Administrative activity audit logs.
  * `/api/files`: File download endpoint serving database-stored base64 attachments directly.
  * `/api/health`: Health-check endpoint for server status monitoring.
* `server/src/middleware/`:
  * `auth.js`: Validates JWT tokens stored in HTTP-only cookies and enforces role requirements (`requireRole('ADMIN')`).
  * `errorHandler.js`: Intercepts unhandled errors and formats JSON responses safely.
* `server/src/lib/`:
  * `prisma.js`: Singleton instance of Prisma Client.
  * `activityLogger.js`: Automated activity logging helper module.

### 2. Security Mechanisms
* **HTTP-Only Cookies**: JWT tokens are issued and stored inside secure, HTTP-only cookies to mitigate XSS risks.
* **Bcrypt Password Encryption**: User passwords are never stored in plain text; they are salted and hashed using bcrypt (10 rounds).
* **CORS Middleware**: Restricts API calls to authorized origins (`localhost:5173`, production frontend domains, Vercel deployments).
* **Role-Based Access Control (RBAC)**: Backend endpoints strictly check JWT payload roles to prevent unauthorized administrative actions.

---

## 🏗️ System Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Frontend (React 19 + Vite 8)"]
        UI["React Single Page Application"]
        Router["React Router v7 (Protected Routes)"]
        Context["Theme & State Context"]
        ApiService["API Fetch Service (Credentials: Include)"]
        
        UI --> Router
        UI --> Context
        UI --> ApiService
    end

    subgraph Server ["Backend Server (Node.js + Express 5)"]
        App["Express Application (app.js)"]
        CORS["CORS & Cookie Parser Middleware"]
        AuthMw["Auth Guard Middleware (JWT Cookie Validation)"]
        
        subgraph Routes ["REST API Controllers (/api)"]
            AuthRoutes["/api/auth"]
            AnnounceRoutes["/api/announcements"]
            EventRoutes["/api/events"]
            QueryRoutes["/api/queries"]
            NotifRoutes["/api/notifications"]
            FileRoutes["/api/files"]
            ActivityRoutes["/api/activity"]
        end

        ActivityLog["Activity Logger Utility"]
        PrismaService["Prisma Client ORM (v6)"]

        App --> CORS
        CORS --> AuthMw
        AuthMw --> Routes
        Routes --> ActivityLog
        Routes --> PrismaService
    end

    subgraph Database ["Cloud Database Tier"]
        PostgreSQL[("Neon Serverless PostgreSQL")]
    end

    ApiService -- "HTTP / REST API (JSON & Cookies)" --> App
    PrismaService -- "SQL / Connection String" --> PostgreSQL
```

---

## 📁 Workspace Directory Structure

```
NotifyHub/
├── index.html                  # Main HTML Entrypoint
├── vite.config.js              # Vite Build Configuration
├── vercel.json                 # Vercel Deployment SPA Rewrites
├── package.json                # Frontend Dependencies & Scripts
├── public/                     # Public Static Assets
├── src/                        # React Frontend Source Code
│   ├── main.jsx                # React Entrypoint
│   ├── App.jsx                 # Main Application Layout Wrapper
│   ├── index.css               # Global CSS Tokens & Variables
│   ├── mobile.css              # Mobile Responsive Styles
│   ├── components/             # Reusable UI Components (Modals, Dropdowns, NavItems)
│   ├── context/                # Theme Context Provider
│   ├── hooks/                  # Custom React Hooks
│   ├── layouts/                # Admin & Student Page Layouts
│   ├── pages/                  # Application Views (Admin Overview, Announcements, Student Home, etc.)
│   ├── routes/                 # Router Configuration & Guards
│   └── services/               # API Request Client Wrapper
└── server/                     # Express Backend Source Code
    ├── package.json            # Server Dependencies & Scripts
    ├── prisma/                 # Database Layer
    │   ├── schema.prisma       # Prisma Database Schema & Models
    │   └── seed.js             # Database Seeding Script
    └── src/                    # Backend Source Files
        ├── app.js              # Express Server Entrypoint
        ├── lib/                # Database Client & Activity Logger
        ├── middleware/         # Auth & Error Handling Middleware
        └── routes/             # REST API Controller Routes
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
* **Node.js** (v18+ recommended)
* **npm** (v9+ recommended)
* **PostgreSQL Database** (e.g. Neon PostgreSQL connection string)

### 1. Installation

Clone the repository and install dependencies for both frontend and backend:

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-example.neon.tech/notifyhub?sslmode=require"

# JWT Secret Key
JWT_SECRET="your_secure_jwt_secret_key_here"

# Server Port & Frontend URL
PORT=5000
FRONTEND_URL=http://localhost:5173

# Frontend Environment Variable
VITE_API_URL=http://localhost:5000
```

Also copy or link `.env` to `server/.env` if needed.

### 3. Database Setup (Prisma & Seeding)

From the `server` directory:

```bash
# Generate Prisma Client
npm run db:generate

# Run Database Migrations (or Push Schema)
npm run db:push

# Seed Initial Admin & Student Accounts
npm run db:seed
```

### 4. Running the Application

Start the Backend Server (Terminal 1):
```bash
cd server
npm run dev
```

Start the Frontend Dev Server (Terminal 2):
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔐 Default Seed Credentials

After running `npm run db:seed`:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@notifyhub` | `haneef5406` |
| **Student** | `yash.kumar@notifyhub` | `yash123` |
| **Student** | `pooja.sharma@notifyhub` | `sharma123` |

---

## 📜 License

Distributed under the MIT License.
