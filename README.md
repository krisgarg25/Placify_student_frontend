# Placify Web Frontend 💻

[![Portfolio](https://img.shields.io/badge/krisgarg.in-Portfolio-0A0A0A?style=for-the-badge&logo=google-chrome&logoColor=white)](https://krisgarg.in)
![React](https://skillicons.dev/icons?i=react,ts,vite,tailwind)

> The web-based student interface for the **Placify** ecosystem — apply for placement drives, track application status, and manage your profile, all from the browser.

**🌐 Live at: [placify.lol](https://placify.lol)**

---

## ✨ Features

- 📋 Browse and apply for on-campus placement drives
- 📊 Track application and interview status in real-time
- 👤 Manage student profile and upload resumes
- 🧠 AI-powered resume analysis and skill matching
- 🔍 View off-campus job opportunities fetched by the crawler
- 🔐 Secure JWT-based authentication

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| [React](https://react.dev/) | UI Framework |
| [Vite](https://vitejs.dev/) | Build Tool & Dev Server |
| [TypeScript](https://www.typescriptlang.org/) | Type Safety |
| [TailwindCSS](https://tailwindcss.com/) | Styling |

---

## 📂 Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images, icons
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-level page components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API call handlers
│   ├── store/          # State management
│   └── main.tsx        # App entry point
├── index.html
├── vite.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v18+`
- npm or yarn
- Placify Backend API running locally (see [backend setup](#))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/placify.git

# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

---

## 🔗 Part of the Placify Ecosystem

Placify is a multi-component platform. This repository is the **Web Frontend** module.

| Component | Description |
|---|---|
| **Mobile App** | React Native (Expo) student app |
| **Backend API** | Node.js + Express — core API gateway |
| **Admin Portal** | Laravel dashboard for placement officers |
| **Landing Page** | Next.js public marketing site |
| **Resume Analyzer** | Python AI service for resume parsing |
| **Job Crawler** | Python bot for off-campus job scraping |

---

## 📄 License

This project is part of the Placify ecosystem. All rights reserved.
