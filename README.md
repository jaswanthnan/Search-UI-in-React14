# Recruitment CRM Dashboard

A modern, full-stack recruitment tracking dashboard built with React, Ant Design, Express, and MongoDB. This application allows recruiters to efficiently search, filter, manage, and export candidate data through an intuitive, light-themed user interface.

## 🚀 Features

* **Advanced Search & Filtering**: 
  * Fast, debounced live search.
  * Real-time keyword highlighting.
  * Dynamic sidebar facets (Skills, Status, Roles, Locations) automatically generated from your database.
* **Multiple Views**:
  * **Results Tab**: Visual layout with detailed candidate cards, colorful avatars, and status badges.
  * **Data Table Tab**: A dense, sortable data grid for power users.
* **Full CRUD Functionality**: 
  * Add new candidates via a clean, validated form.
  * Edit existing candidates directly from the dashboard.
  * Delete individual candidates.
* **Bulk Actions**:
  * Checkbox row selection in the Data Table.
  * Bulk delete multiple candidates simultaneously.
  * Export selected candidate data directly to a `.csv` file.

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Ant Design (UI Library), vanilla CSS.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB (Local instance).

## 📂 Project Structure

```
Search UI in React/
├── src/
│   ├── components/
│   │   └── SearchPage.jsx   # Main application component containing tabs, tables, and logic
│   ├── App.jsx              # App entry point, configures Ant Design theme
│   ├── index.css            # Global UI styling and CRM theme definitions
│   └── main.jsx
├── server.js                # Express API Backend (GET, POST, PUT, DELETE)
├── package.json
└── README.md
```

## ⚙️ Setup Instructions

### Prerequisites
1. [Node.js](https://nodejs.org/) installed on your machine.
2. [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`.

### 1. Database Setup
The backend expects a database named `talent_db` and a collection named `candidates`.
You can populate it using the provided `seed.js` script:
```bash
node "../Elasticsearch/seed.js"
```

### 2. Start the Backend Server
The Express server handles all API routes and communicates with MongoDB.
```bash
# Navigate to the project root
npm install express cors mongodb
node server.js
```
The server will start on `http://localhost:5000`.

### 3. Start the Frontend Application
In a separate terminal window, start the React development server:
```bash
npm install
npm run dev
```
The application will launch on `http://localhost:5173`.

## 📡 API Endpoints

* `GET /api/data`: Fetch all candidate records.
* `POST /api/data`: Add a new candidate.
* `PUT /api/data/:id`: Update an existing candidate's information.
* `DELETE /api/data/:id`: Delete a single candidate.
* `POST /api/data/bulk-delete`: Delete multiple candidates by ID array.
