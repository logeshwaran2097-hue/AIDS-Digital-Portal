# V.S.B. Engineering College (Autonomous)
## Department of Artificial Intelligence & Data Science (AI & DS) — Enterprise Digital Portal

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.17-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org/)
[![AI Powered](https://img.shields.io/badge/AI_Assistant-Gemini_NLP-8E75C4?style=for-the-badge&logo=google)](https://ai.google.dev/)

---

### Executive Overview

The **V.S.B. AI & DS Digital Portal** is a production-grade, full-stack enterprise institutional management platform tailored for the Department of Artificial Intelligence & Data Science. Built with modern web engineering standards, the system unifies students, faculty, department leadership, and system administrators into an integrated, real-time reactive ecosystem.

---

## Key Features & Architecture

```mermaid
graph TD
    A[Root System Administrator] -->|Full Jurisdiction| B[Centralized Directory]
    B --> C[HOD Leadership]
    B --> D[Faculty Directorate]
    B --> E[Students Roster]
    B --> F[Curriculum & Labs - 8 Semesters]
    B --> G[Announcements & Circulars]
    B --> H[AI Assistant Knowledge Engine]
    
    C -->|Department Governance| I[Staff & Timetables]
    D -->|Academic Execution| J[Attendance & Practical Labs]
    E -->|Student Life Cycle| K[Academics, Marks & Projects]
    H -->|Real-Time SQLite Query| L[Instant Answers on Any Device]
```

---

## Role-Based Portals & Capabilities

### 1. 🛡️ Super Administrator Command Center (`/admin`)
- **Centralized Administrative Directory**: 12 modular subsystems covering User Accounts, Curricula, Question Banks, Capstones, Audit Logs, and System Security.
- **Live Database Counter Metrics**: Real-time SQLite statistics reflecting exact counts of enrolled students, faculty, HOD records, and active circulars.
- **Automated Baseline Seeding & Cleansing**: 1-click **`✨ Seed Baseline Data`** (populates HOD, faculty across 8 semesters, sample students, and circulars) and **`🗑️ Clean Sample Data`** (restores a pristine state while safely preserving admin accounts).
- **High-Fidelity PDF Vector Engine**: Institutional emblem-watermarked executive audit reports and data exports.

### 2. 👑 Head of Department (HOD) Leadership Portal (`/hod-dashboard`)
- **Automated Faculty ID & Onboarding**: Auto-assigned identifier (`HOD001`, `HOD002`), optional email, and default temporary password `nitr`.
- **First-Time Login Profile Completion**: Forces new HODs to customize credentials and bio upon initial sign-in.
- **Academic Governance**: Department-wide oversight of Class Advisors, laboratory handlers, research publications, and end-semester practical schedules.

### 3. 👨‍🏫 Faculty Directorate & Class Advisors (`/faculty-dashboard`)
- **8-Semester Faculty Matrix**: Direct assignment as **Class Advisors** across Semesters 1 to 8 (Sections A & B) and **Laboratory Handlers**.
- **Institutional 8-Period Bell Timings**: Built-in master timetable matrix for Theory and Practical Blocks (Forenoon: `09:15 AM - 12:30 PM` | Afternoon: `01:20 PM - 04:30 PM`).
- **Attendance & Course Packs**: Daily period-wise attendance marking, lecture slide distribution, and IAT question paper uploads.

### 4. 🎓 Student Academic Portal (`/dashboard`)
- **8-Semester Curriculum & Marks**: Semester-by-semester view of core theory and practical lab subjects.
- **75% Attendance Compliance Monitor**: Real-time calculation with warning notifications for condonation thresholds (<75%).
- **Capstone Project Hub**: Submission and tracking for Year 3 Mini Projects (`AD2614`), Year 4 Phase I (`AD2711`), and Capstone Final (`AD2811`).
- **On-Duty (OD) & Leave Application**: Digital workflow for symposiums, sports, and medical leaves.

---

## 🔬 Complete 8-Semester Laboratory Curriculum

| Semester | Code | Practical Laboratory Course | Schedule / Session |
| :--- | :--- | :--- | :--- |
| **Sem 1** | `GE2111` | Problem Solving & Python Programming Laboratory | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 1** | `BS2112` | Physics and Chemistry Laboratory | Forenoon (`09:15 AM - 12:30 PM`) |
| **Sem 1** | `GE2113` | Engineering Graphics & CAD Laboratory | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 2** | `CS2211` | C Programming & Data Structures Laboratory | Forenoon (`09:15 AM - 12:30 PM`) |
| **Sem 2** | `EE2212` | Basic Electrical & Electronics Engineering Laboratory | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 2** | `GE2213` | Workshop Practice Laboratory | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 3** | `AD2311` | Object Oriented Programming Laboratory (OOP Lab) | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 3** | `AD2312` | Database Management Systems Laboratory (DBMS Lab) | Forenoon (`09:15 AM - 12:30 PM`) |
| **Sem 3** | `AD2313` | Data Structures and Algorithms Laboratory (DSA Lab) | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 4** | `AD2411` | Machine Learning Laboratory | Forenoon (`09:15 AM - 12:30 PM`) |
| **Sem 4** | `AD2412` | Operating Systems Laboratory | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 4** | `AD2413` | Java & Web Technologies Laboratory | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 5** | `AD2511` | Cloud Services & Management Laboratory | Forenoon (`09:15 AM - 12:30 PM`) |
| **Sem 5** | `AD2512` | Big Data Analytics Laboratory | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 5** | `AD2513` | Deep Learning Laboratory | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 5** | `AD2514` | Business Analytics Laboratory | Forenoon (`09:15 AM - 12:30 PM`) |
| **Sem 5** | `AD2515` | Communication Training | Period 7 & 8 (`03:05 PM - 04:30 PM`) |
| **Sem 5** | `AD2516` | Aptitude & Soft Skills Training | Period 7 & 8 (`03:05 PM - 04:30 PM`) |
| **Sem 5** | `AD2517` | Web Development Laboratory | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 6** | `AD2611` | Natural Language Processing Laboratory | Forenoon (`09:15 AM - 12:30 PM`) |
| **Sem 6** | `AD2612` | Computer Vision & Image Processing Laboratory | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 6** | `AD2613` | Mobile Application Development Laboratory | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 6** | `AD2614` | Mini Project & Product Development | Full Day Practical Block |
| **Sem 7** | `AD2711` | Project Work Phase I (Capstone Research) | Dedicated Practical Block |
| **Sem 7** | `AD2712` | Placement and Training (Corporate Readiness) | Afternoon (`01:20 PM - 04:30 PM`) |
| **Sem 8** | `AD2811` | Project Work Phase II (Capstone Final Implementation) | Dedicated Project Block |
| **Sem 8** | `AD2812` | Industrial Internship & Comprehensive Viva Voce | Autonomous / Industry Evaluation |

---

## ⏰ Institutional 8-Period Daily Bell Timings

| Period / Slot | Time Window | Duration | Academic Description |
| :--- | :--- | :--- | :--- |
| **Period 1** | `09:15 AM - 10:00 AM` | 45 mins | Morning Theory / Core Lecture |
| **Period 2** | `10:00 AM - 10:45 AM` | 45 mins | Morning Theory / Core Lecture |
| ☕ **Morning Break** | `10:45 AM - 11:00 AM` | 15 mins | Morning Refreshment Interval |
| **Period 3** | `11:00 AM - 11:45 AM` | 45 mins | Mid-Morning Core / Advanced Theory |
| **Period 4** | `11:45 AM - 12:30 PM` | 45 mins | Mid-Morning Core / Advanced Theory |
| 🍱 **Lunch Break** | `12:30 PM - 01:20 PM` | 50 mins | Midday Dining & Campus Interval |
| **Period 5** | `01:20 PM - 02:05 PM` | 45 mins | Afternoon Theory / Lab Practical Block |
| **Period 6** | `02:05 PM - 02:50 PM` | 45 mins | Afternoon Theory / Lab Practical Block |
| 🍵 **Tea Break** | `02:50 PM - 03:05 PM` | 15 mins | Evening Tea & Refreshment Interval |
| **Period 7** | `03:05 PM - 03:50 PM` | 45 mins | Soft Skills / Communication / Lab |
| **Period 8** | `03:50 PM - 04:30 PM` | 40 mins | Aptitude Bootcamps / Faculty Mentorship |

---

## 📢 Multi-Target Circulars & Announcements

The portal features an advanced official circular broadcast system:
- **Categorized Optgroups**:
  - *Academics & Exams* (`ACADEMIC`, `TIMETABLE`, `CURRICULUM`)
  - *Career & Placement* (`PLACEMENT`, `INTERNSHIP`, `APTITUDE`)
  - *Symposia & Innovation* (`SYMPOSIUM`, `HACKATHON`, `WORKSHOP`)
  - *Student Welfare* (`CLUB`, `SCHOLARSHIP`)
  - *Logistics & Governance* (`FACULTY_NOTICE`, `LOGISTICS`, `GENERAL`)
- **Target Filtering**: Broadcast specifically to **Individual Semesters (Sem 1 to 8)**, **Academic Years (Years 1 to 4)**, **Class Advisors Only**, **Lab Instructors**, or **General Campus**.

---

## 🤖 Real-Time Dynamic AI Chatbot Assistant

The floating AI assistant is directly integrated into the live SQLite database:
- **Instant Student Lookup**: Search any register number (e.g. `922522AD001`) to view student credentials, year, and section.
- **Faculty & HOD Inquiries**: Queries about staff names, faculty IDs, course allocations, and advisor roles are answered immediately.
- **Lab & Timetable Intelligence**: Natural language understanding for queries like *"labs for 2nd year"*, *"3rd year practicals"*, or *"what are the bell timings?"*.
- **Universal Multi-Table Search**: Any newly added record in the database is indexed and answered in real time.

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- **Node.js** v18.17+ or v20+
- **npm** or **yarn** / **pnpm**
- **Git**

### 2. Clone Repository
```bash
git clone https://github.com/logeshwaran2097-hue/AIDS-Digital-Portal.git
cd AIDS-Digital-Portal
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="vsb-ai-ds-super-secret-jwt-key-2026"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
GEMINI_API_KEY="" # Optional for Google Gemini Cloud NLP
```

### 5. Setup Database
```bash
npx prisma generate
npx prisma db push
```

### 6. Run the Application
```bash
# Production Build & Run
npm run build
npm start

# Or Development Mode
npm run dev
```

Visit the application at: **[`http://localhost:3001`](http://localhost:3001)**

---

## 🔑 Default Credentials & Onboarding

| Role | Identifier / Email | Default Password | Notes |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `lonelyking44y@gmail.com` | Custom Admin Password | Tier-0 Full Access |
| **HOD** | `HOD001` or `hod.ai@vsb.edu.in` | `nitr` | Prompts profile completion on first login |
| **Faculty** | `FAC001` (or assigned ID) | `nitr` | Prompts password change on first login |
| **Student** | Register Number (e.g. `922522AD001`) | `nitr` | Prompts bio completion & permanent password |

---

## 📱 Google Play Store & APK Deployment

The portal is packaged with PWA manifest, service workers, and responsive viewport scaling ready for TWA (Trusted Web Activity) / Android packaging. Refer to [`PLAYSTORE_LAUNCH_GUIDE.md`](./PLAYSTORE_LAUNCH_GUIDE.md) for full deployment instructions.

---

## 🏛️ Institutional Accreditation & Identity
- **Institution**: V.S.B. Engineering College (Autonomous)
- **Department**: Department of Artificial Intelligence & Data Science
- **Affiliation**: Anna University, Chennai · Approved by AICTE
- **Accreditation**: NAAC 'A' Grade · NBA Tier-1 Accredited
- **Location**: NH-67, Covai Road, Karur - 639 111, Tamil Nadu, India

---

## 📜 License & Copyright
Developed for **V.S.B. Engineering College — Department of AI & DS**. All rights reserved. © 2026.