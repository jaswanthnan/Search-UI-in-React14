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

## 🔍 API Documentation

The backend server runs on `http://localhost:5000` by default. All data endpoints are prefixed with `/api/data`.

### 1. Search and Facets
Fetches candidates based on search terms and filters, and returns count-based facets for all categories.

**Endpoint:** `GET /api/data/facets`

**Query Parameters:**
- `q`: Search keyword (name, role, or skills)
- `skills[]`: Array of skills to filter by
- `status[]`: Array of statuses to filter by
- `location[]`: Array of locations to filter by

**Example:**
```bash
curl "http://localhost:5000/api/data/facets?q=React&skills\[\]=Node.js&status\[\]=APPLIED"
```

### 2. Add New Candidate
Creates a new candidate record in the database.

**Endpoint:** `POST /api/data`

**Example:**
```bash
curl -X POST http://localhost:5000/api/data \
-H "Content-Type: application/json" \
-d '{
  "name": "Jane Doe",
  "role": "Frontend Developer",
  "location": "Mumbai",
  "experience": 3,
  "skills": ["React", "JavaScript", "CSS"],
  "status": "APPLIED"
}'
```

### 3. Update Candidate
Updates an existing candidate by their ID.

**Endpoint:** `PUT /api/data/:id`

**Example:**
```bash
curl -X PUT http://localhost:5000/api/data/65d1234567890abcdef \
-H "Content-Type: application/json" \
-d '{
  "name": "Jane Smith",
  "status": "INTERVIEWING"
}'
```

### 4. Delete Candidate
Removes a single candidate by their ID.

**Endpoint:** `DELETE /api/data/:id`

**Example:**
```bash
curl -X DELETE http://localhost:5000/api/data/65d1234567890abcdef
```

### 5. Bulk Delete
Deletes multiple candidates at once.

**Endpoint:** `POST /api/data/bulk-delete`

**Example:**
```bash
curl -X POST http://localhost:5000/api/data/bulk-delete \
-H "Content-Type: application/json" \
-d '{
  "ids": ["id1", "id2", "id3"]
}'
```

## 📄 License

MIT
