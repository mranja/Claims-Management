# Claims Management Platform 🛡️

A full-stack MERN (MongoDB, Express.js, React, Node.js) application designed for healthcare insurance reimbursement management. The platform features two dedicated role-aware portals: a **Patient Portal** for submitting and tracking claims, and an **Insurer Portal** for reviewing, filtering, and adjudicating claims.

> ⚡ **Zero-Configuration Ready**: Features an automatic in-memory MongoDB fallback (`mongodb-memory-server`) and auto-seeding. It runs seamlessly out of the box even if you don't have a local MongoDB daemon installed!

---

## 🌟 Key Features

### 👤 Patient Portal
* **Role-Aware Authentication**: Secure JWT-based login with persistent user sessions and one-click demo login buttons.
* **Claim Submission Form**: Interactive form with multi-field input validation (amount, description) and drag-and-drop document upload (receipts, prescriptions).
* **Patient Dashboard**: Real-time status tracking with color-coded badges (Pending 🟡, Approved 🟢, Rejected 🔴), submission timestamps, requested amount vs. approved amount, and inline document preview modal.
* **Metrics Overview**: Summary statistics showing total claims submitted, pending count, total claimed amount, and reimbursed total.

### 🏢 Insurer Portal
* **Claims Queue Dashboard**: Comprehensive table listing all patient claims across the system with sortable columns (Date, Amount, Status).
* **Multi-Parametric Filtering**: Query claims by status dropdown (`Pending`, `Approved`, `Rejected`), date range (`fromDate` / `toDate`), amount range (`minAmount` / `maxAmount`), and keyword search (Patient Name, Email, Claim ID).
* **Adjudication Detail View (`/insurer/claims/:id`)**:
  * Full claim metadata & patient profile overview.
  * Inline document preview for PDF and Image receipts.
  * Adjudication form to Approve or Reject claims with custom approved amount and insurer comments.
  * **Strict State Transition Validation**: Prevents re-adjudicating claims that are already Approved or Rejected (Pending → Approved/Rejected only).

---

## 🏗️ Monorepo Structure

```
Claims-Management/
├── frontend/                   # Vite + React 18 + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, StatusBadge, DocumentViewer, ProtectedRoute)
│   │   ├── context/            # AuthContext (JWT, user state, RBAC helpers)
│   │   ├── pages/              # Page views (LoginPage, PatientDashboard, SubmitClaimPage, InsurerDashboard, ClaimDetailPage)
│   │   ├── services/           # Axios API layer with interceptors (authApi, claimsApi)
│   │   ├── App.jsx             # Router & Protected route definitions
│   │   ├── main.jsx            # React DOM entry
│   │   └── index.css           # Tailwind CSS directives & enterprise glassmorphic theme
│   ├── package.json
│   └── vite.config.js          # API dev server proxy configuration
│
├── backend/                    # Node.js + Express Layered Backend Architecture
│   ├── src/
│   │   ├── config/             # DB connection with auto MongoMemoryServer fallback & auto-seeding
│   │   ├── controllers/        # Thin controllers handling HTTP requests/responses
│   │   ├── middleware/         # Auth verification, RBAC, Multer upload, Central Error Handler, Logging
│   │   ├── models/             # Mongoose schemas (User, Claim)
│   │   ├── routes/             # Express route declarations (authRoutes, claimRoutes)
│   │   ├── services/           # Core business logic layer & claim state machine rules
│   │   ├── utils/              # Standardized API response formatters & input validators
│   │   ├── seed.js             # Seeding script for mock patients, mock insurer & sample claims
│   │   └── app.js              # Express app entry point
│   ├── uploads/                # Local storage directory for uploaded claim files
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔑 Seeded Test Credentials

The backend automatically seeds initial test users and sample claims upon first startup:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Patient 1** | John Doe | `patient1@test.com` | `Test@123` |
| **Patient 2** | Jane Smith | `patient2@test.com` | `Test@123` |
| **Insurer Admin** | Sarah Connor | `insurer@test.com` | `Test@123` |

*Note: The frontend login page includes quick pre-fill buttons for these test accounts.*

---

## ⚡ Quick Start Setup Guide

### 1️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start Backend Server (Auto-connects to MongoDB or launches In-Memory MongoDB automatically)
npm run dev
```
The server will start on `http://localhost:5000`.

---

### 2️⃣ Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Frontend Dev Server
npm run dev
```
The application will open at `http://localhost:5173`.
