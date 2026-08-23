# 🛡️ CloudNet ICES (Integrated Cloud Email Security)

> **Autonomous Zero-Trust Cloud Email Security & Inbound Threat Intelligence Platform**  
> Built for sub-second zero-day BEC detection, Executive Impersonation interception, Quishing QR decoding, and non-destructive mailbox remediation.

---

## ⚡ Executive Architecture & Capabilities

### 1. Zero-Shot Gemini AI Threat & Linguistic Intent Decomposition
* **Multi-Model Dynamic Failover Pool**: Resilient orchestration across `gemini-3.5-flash-lite` ➔ `gemini-3.5-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-3.6-flash` with automatic rate-limit backoff.
* **BEC Classification**: Deep semantic identification of Executive Impersonation, Urgent Wire Fraud, Payroll Diversion, and Supplier Invoice Alteration.
* **Linguistic Urgency & Deception Taxonomy**: Real-time extraction of high-pressure conversational cues and social engineering tactics.
* **Bank Entity Extraction**: Autonomous parsing of beneficiary names, routing numbers, account numbers, and requested funds ($USD).
* **SHA-256 Telemetry Caching**: In-memory caching prevents duplicate LLM calls on identical email bodies while keeping live token accounting.

### 2. Autonomous Inbound Threat Radar Scanner
* **360° Conic Sweep HUD**: Real-time rotating radar dish monitoring incoming Gmail streams for payload anomalies.
* **Optical QR Decoding (Quishing)**: Extracts and verifies obfuscated target URLs from image attachments and inline base64 streams.
* **Plaintext HTTP Interception**: Flags unencrypted `http://` links (e.g. `httpforever.com`) susceptible to MitM interception with instant `90 (CRITICAL)` isolation.

### 3. SMTP Relay Traversal & GeoIP Telemetry
* **Hop-by-Hop Trace**: Parses `Received:` RFC headers back to originating Mail Transfer Agents (MTAs).
* **Network Origin Detection**: Flags Tor exit nodes, high-risk unverified VPS hosting relays, and cross-border geographic anomalies.
* **RFC Cryptographic Authentication Matrix**: Granular status evaluation for `SPF`, `DKIM`, and `DMARC` alignment.

### 4. Non-Destructive Mailbox Remediation & Dynamic Safety Banners
* **Dynamic Gmail Label Provisioning**: Automatically applies high-contrast `[SUSPICIOUS]` tag badges directly to employee inboxes.
* **In-Mailbox Safety Banner Injection**: Renders contextual high-contrast warning banners for threats (Score ≥ 50) and clean delivery indicators for authenticated safe mail (Score < 50).
* **1-Click Cluster Quarantine (Search & Destroy)**: SOC analysts can purge matching threat clusters across all enterprise mailboxes in under 200ms.
* **Self-Healing OAuth Gateway**: Background token renewal catches 60-minute Google OAuth expirations and auto-refreshes credentials seamlessly.

### 5. Dark Navy Blue (#00008B) & Obsidian Carbon Design System
* **100% Solid Opaque Architecture**: Pure solid surfaces (`#050811` / `#0A0F1D`) with zero bleed-through and maximum legibility.
* **Executive Email Inbox Cards**: Circular sender avatars with initials, threat-coded visual risk rings, and high-contrast typography.
* **Right-Hand Floating Action Dock**: Smooth leftward-bulging cards (`-translate-x-2`, `scale-105`) with curved selection aura halos.
* **Sub-50ms SOC Stream Response**: Neon PostgreSQL caching with asynchronous background Gmail syncing.

---

## 🛠️ Technology Stack

### Backend
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **FastAPI (Python 3.11)** | High-performance asynchronous REST API. |
| **Server** | **Uvicorn** | ASGI server with hot-reload and background worker tasks. |
| **Database** | **PostgreSQL (Neon Serverless)** / **AsyncPG** | Async relational persistence with connection pooling. |
| **ORM** | **SQLAlchemy 2.0 (Async)** | Non-blocking schema definitions and CRUD abstraction. |
| **Cloud Mail API** | **Google Workspace API / OAuth2** | Non-destructive label modification and raw EML retrieval. |
| **AI / LLM** | **Google Gemini 3.5 / 3.6 Flash** | Deep reasoning zero-shot intent and BEC decomposition. |
| **GeoIP / Network** | **MaxMind GeoIP2** | Originating IP ASN, ISP, and geographic geolocation. |

### Frontend
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **React 18** + **TypeScript** | Type-safe declarative component architecture. |
| **Bundler** | **Vite** | Sub-second HMR and production bundle optimization. |
| **Styling** | **Tailwind CSS (Vanilla CSS Tokens)** | Dark Navy Blue (#00008B) 100% solid opaque design system. |
| **Visual Forensics**| **@xyflow/react (ReactFlow)** | Node-graph visualizer for multi-hop SMTP relay tracing. |
| **Icons** | **Lucide React** | Clean, minimalist SVG iconography. |

---

## 📁 Repository Structure

```
project/
├── ICES-Backend/
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   │   ├── alerts.py            # Real-time alert ingestion, metrics & caching
│   │   │   ├── auth.py              # Google OAuth2 connect & callback flows
│   │   │   ├── remediation.py       # Quarantine, release, and cluster purge actions
│   │   │   ├── admin.py             # VIP directory & runtime configuration
│   │   │   └── forensics.py         # Raw EML & header analysis
│   │   ├── core/
│   │   │   └── config.py            # Pydantic v2 settings & environment variables
│   │   ├── db/
│   │   │   ├── base.py              # SQLAlchemy async engine & sessionmaker
│   │   │   ├── models.py            # EmailAlert, ForensicLog, NLPEvaluation models
│   │   │   └── crud.py              # High-performance async database operations
│   │   └── modules/
│   │       ├── ingestion/           # GmailClient & RFC-822 MIME parser
│   │       ├── intelligence/        # Gemini NLP, VIP Detector, Attachment Scanner
│   │       └── remediation/         # Warning Banner Engine & Remediation Actions
│   ├── requirements.txt             # Python dependencies
│   └── Procfile                     # Render production web service worker
│
└── ICES-Frontend/
    ├── src/
    │   ├── components/soc/
    │   │   ├── header.tsx           # SOC Cockpit header with vector logo & live UTC
    │   │   ├── radar-scanner.tsx    # 360° Inbound stream radar with live counter
    │   │   ├── floating-index-bar.tsx# Right-hand action dock with bulging flyouts
    │   │   ├── alert-feed.tsx        # Executive email inbox stream with avatars
    │   │   ├── progressive-panel.tsx # Forensic Workbench & dynamic safety banner
    │   │   ├── metrics-bar.tsx       # Real-time telemetry ribbon
    │   │   └── webhook-simulator.tsx # BEC Attack Payload Simulation Matrix
    │   ├── types/ices.ts             # TypeScript definitions for alerts and tokens
    │   └── styles/globals.css        # Dark Navy Blue (#00008B) design system
    ├── package.json
    └── vite.config.ts
```

---

## 🔌 Core API Endpoints

### 1. Alert Telemetry & Inbound Stream
- `GET /api/v1/alerts/`: Instantly returns persisted alerts (<50ms) and triggers background mailbox ingestion.
- `GET /api/v1/alerts/metrics`: Returns live SOC velocity, MTTR, threat breakdown, and Gemini AI Token Accounting stats.

### 2. Autonomous & Manual Remediation
- `POST /api/v1/remediation/execute`: Executes `QUARANTINE` (applies `[SUSPICIOUS]` tag) or `RELEASE` on live mailbox.
- `POST /api/v1/remediation/cluster-purge`: 1-Click Search & Destroy across all enterprise mailboxes.
- `GET /api/v1/remediation/report-phish`: User-facing callback confirmation portal for reported suspicious messages.

### 3. Google Workspace OAuth2 Lifecycle
- `GET /api/v1/auth/google/authorize`: Initiates Google OAuth2 consent flow with Gmail modify scopes.
- `GET /api/v1/auth/google/callback`: Exchanges authorization code and securely persists encrypted tokens in Neon PostgreSQL.

---

## 💻 Local Development Setup

### 1. Start Backend
```bash
cd ICES-Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start Frontend
```bash
cd ICES-Frontend
npm install
npm run dev
```

Open `http://localhost:3000` (or `5173`) in your browser.

---

## 🛡️ License & Compliance
Built under the **MIT License**. Compliant with zero-trust cloud email security standards, RFC-822 / RFC-5322 MIME specifications, and Google Workspace security API policies.