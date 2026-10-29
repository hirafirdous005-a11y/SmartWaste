# Smart Waste Monitoring System – AI and GPS-Based Waste Management Platform

A modern, responsive, full-stack municipal environmental platform connecting **Citizens**, **Administrators**, and **Frontline Sanitation Workers** on a single unified system to report, detect, assign, clean, and monitor urban waste using smartphone camera capture, real-time GPS geolocation, and AI-based waste classification.

---

## 🌟 Key Highlights & Architecture

### 1. Three Separate Portals
- **Citizen / User Portal (`/citizen`)**:
  - Register & login securely.
  - Mobile camera capture (`capture="environment"`) & photo upload.
  - Automatic browser GPS coordinate detection with permission prompt.
  - Interactive Leaflet & OpenStreetMap with draggable pin for pinpoint precision.
  - Reverse geocoding via OpenStreetMap Nominatim.
  - Real-time AI waste classification (material type, wet/dry distinction, confidence score, hazard level, disposal guidelines).
  - Unique Complaint IDs (e.g., `SWM-2026-1041`).
  - Live complaint lifecycle tracking (Submitted &rarr; Under Review &rarr; Assigned &rarr; In Progress &rarr; Resolved &rarr; Rejected).
  - Assigned worker tracking with contact & zone.
  - Community awareness nearby waste map with privacy preserved (no phone numbers or citizen identities exposed).
  - Confirm resolution or reopen complaints with comments.

- **Municipal Administrator Portal (`/admin`)**:
  - Executive dashboard with real-time KPI counters (Total, Pending Review, Assigned, In Progress, Resolved, Overdue).
  - Citywide interactive GPS map with automatic **Waste Hotspot Density Clusters**.
  - AI prediction review and **manual category override** tool.
  - Smart sanitation squad assignment based on zone and active workload.
  - Worker fleet management (availability, ratings, active task count, completed count).
  - Analytics & visual reports (waste category distribution, pipeline funnel, ward density).
  - Downloadable **CSV Report Export** (`/api/reports/export`).
  - Immutable compliance **Audit Trail** (`/admin/audit`).

- **Sanitation Worker Portal (`/worker`)**:
  - Ergonomically designed for single-hand Android mobile usage.
  - Active assigned collection tasks view with priority indicators.
  - Interactive route map + **"Open in Google Maps / Turn-by-Turn Navigation"** external link.
  - Real-time task step progression:
    1. *Acknowledge & Accept Task*
    2. *Start Route (On the Way)*
    3. *Arrive On-Site (In Progress)*
    4. *Submit Proof & Complete*
  - Photographic proof upload (Before & After photos) with completion notes.
  - Obstacle reporting modal (inaccessible site, wrong GPS, equipment missing, biohazard).
  - Completed task history ledger.

---

## 🧠 Genuine AI Waste Classification Engine

The system features an AI image-classification endpoint at `/api/ai/classify-waste` supporting:
1. **Google Gemini 1.5 Flash Vision API** via backend multimodal API.
2. 10 specialized municipal waste categories:
   - Wet waste
   - Dry waste
   - Organic waste
   - Plastic waste
   - Paper waste
   - Glass waste
   - Metal waste
   - E-waste
   - Hazardous waste
   - Mixed waste
3. Macro distinction between **Wet stream** and **Dry stream**.
4. Scientific disposal recommendations, recyclability rating, and hazard level warnings (None, Low, Moderate, High).
5. Transparent fallback status: If `GEMINI_API_KEY` is not supplied, it displays a clear connectivity banner and allows running the built-in demo computer vision model.

---

## 🗄️ Database Design & Supabase PostgreSQL

The platform includes a production-grade PostgreSQL schema in `supabase/schema.sql` featuring:
- `profiles`: Citizen, worker, and admin accounts with zone & status.
- `waste_reports`: Complete complaint record with lat/long, AI predictions, verified categories, priority, and citizen feedback.
- `worker_tasks`: Task progression, timestamps, obstacle reports.
- `task_images`: Before-and-after photographic evidence.
- `notifications`: Push and in-app alerts for state transitions.
- `audit_logs`: Administrative action tracking.
- Row Level Security (RLS) policies guaranteeing role-based isolation.

*Dual-Mode Operation:*
- **Production Mode**: Automatically connects to Supabase if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are provided.
- **Local Fallback Mode**: Instantly testable out of the box with zero external configuration using reactive local persistent state pre-seeded with high-fidelity sample data.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Variables Configuration
Copy the `.env.example` file to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your credentials (optional for testing):
- `GEMINI_API_KEY`: Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/).
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase project keys.

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your desktop browser or Android mobile phone on the same Wi-Fi network.

### 4. Standalone HTML & JavaScript Edition (Zero Setup / Direct Browser Execution)
The project also includes a **pure HTML, CSS, and JavaScript edition** that runs directly without Node.js or build steps:
- **Direct File**: Double-click [`index.html`](file:///c:/Users/dmiql/OneDrive/Desktop/urban/index.html) in your file manager to open it immediately in Google Chrome, Microsoft Edge, or Firefox.
- **Via Local Server**: Open [http://localhost:3000/standalone.html](http://localhost:3000/standalone.html).
- **Features in HTML/JS Edition**:
  1. Starts with **Login Procedure Gate** (Citizen, Sanitation Worker, Municipal Admin).
  2. Multi-Page Client-Side SPA routing (`#citizen-dashboard`, `#citizen-report`, `#worker-tasks`, `#admin-dashboard`, `#admin-map`).
  3. Camera snapshot & automated GPS geolocation tracking (`navigator.geolocation`).
  4. Multi-stream AI waste classification with speech synthesis voice announcement (`window.speechSynthesis`).
  5. Automated proximity sanitation squad dispatch using the **Haversine GPS distance formula**.
  6. Interactive OpenStreetMap with color-coded waste markers (Leaflet.js).
  7. Full `localStorage` persistence.

---

## 🧪 Testing Personas & Administrator Authentication

### Dedicated Administrator Authentication Gate (`/admin/login`)
The Municipal Administrator Portal is protected by a **Level 4 Security Clearance Layout Guard**. Unauthorized visitors are blocked and redirected to the official authentication terminal.

| Role | Officer / User | Email | Password / PIN | Clearance |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Dr. Priya Desai | `admin@urban.eco` | `AdminSecure@2026` &bull; **2FA PIN:** `2026` | **Level 4 Environmental Director** |
| **Citizen** | Aarav Sharma | `citizen@urban.eco` | `Citizen@2026` | Public Reporter |
| **Sanitation Worker** | Rajesh Kumar | `worker@urban.eco` | `Worker@2026` | Zone 1 Sanitation Crew |

#### Admin Security Features:
- **Badge ID Verification**: Authenticates with `MUNI-ADM-2026-904`.
- **Workstation Terminal Lock**: Administrators can click **"Lock"** on their command bar to secure the desk with a 4-digit PIN (`2026`) without ending their 8-hour shift.
- **Audit Logging**: Successful authentications, failed attempts, and lock events are permanently recorded in the immutable compliance ledger (`/admin/audit`).

---

## 📱 Android Mobile Compatibility

- **Responsive Viewport**: Touch-friendly buttons (minimum 44px hit targets), card padding, and legible font hierarchy.
- **Mobile Bottom Navigation**: Bottom tab bar (`Home`, `Report`, `Track`, `Map`) for rapid thumb-friendly navigation on Android devices.
- **Hardware Camera Access**: Uses `accept="image/*"` with `capture="environment"` attribute to directly launch the native Android camera.
- **Progressive Web App**: Includes `manifest.json` and theme meta-color (`#059669`) for Android home-screen installation.
