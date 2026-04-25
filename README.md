# Talent Tracker - Search UI in React

A modern, professional Recruitment CRM Search Interface built with React, Ant Design, and Node.js. This project demonstrates a high-performance faceted search system with explicit action triggers and real-time highlighting.

## 🚀 Features

- **Faceted Search**: Filter candidates by Skills, Status, Roles, and Locations.
- **Explicit Search Trigger**: Avoids redundant API calls by applying filters and search terms only when the "Search" button is clicked or Enter is pressed.
- **Live Highlight**: Automatically highlights matched search terms across Name, Role, Skills, and Status fields in the result cards.
- **Responsive Design**: Premium aesthetics using Ant Design, optimized for all screen sizes.
- **Full Stack Integration**: Communicates with a Node.js/Express backend powered by MongoDB.
- **Dynamic Facet Counts**: Real-time display of candidate counts per filter category.
- **Bulk Operations**: Support for data table view with bulk delete and CSV export.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Ant Design (antd), Axios, Lodash
- **Backend**: Node.js, Express, MongoDB
- **Styling**: Vanilla CSS with custom AntD overrides

## 📋 Prerequisites

- Node.js (v16+)
- MongoDB (Running locally or via Atlas)

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd search-ui-react
```

### 2. Setup Backend
```bash
cd server
npm install
# Ensure your MongoDB connection string is correct in config/db.js
node server.js
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```text
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (Candidates.jsx)
│   │   ├── components/    # Reusable UI components
│   │   └── index.css      # Global styles and design system
├── server/                 # Express backend
│   ├── routes/            # API endpoints
│   ├── models/            # Database schemas
│   └── server.js          # Entry point
└── README.md
```

## 🔍 API Usage

Search by name, role, or skills:
`GET /api/data?name=aruna`

## 📄 License

MIT
