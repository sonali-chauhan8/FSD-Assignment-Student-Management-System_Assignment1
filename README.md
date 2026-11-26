# Student Management System (B.Tech FSD Assignment 1)

A clean, beginner-friendly full-stack **Student Management System** built using **HTML, CSS, Vanilla JavaScript, Node.js, Express.js, MongoDB, and Mongoose**.

## Features

- **Add Student**: Create new student records with Name, Enrollment Number, Email, Branch, Semester, and Section.
- **View Students**: Responsive table displaying all student records sorted by most recently added.
- **Edit Student**: Update any student's details directly from the dashboard.
- **Delete Student**: Remove records safely with a confirmation modal.
- **Search**: Live search by student **Name** or **Enrollment Number**.
- **Validation & Duplicate Prevention**: Client-side and Mongoose schema validation, plus unique Enrollment Number checks.
- **Total Count & Alerts**: Live total student count in the header and clear success/error notifications.
- **Theme**: Professional blue-and-white responsive dashboard.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (`fetch` API)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose

## Project Structure

```text
FSD-Assignment-1-Student-Management-System/
├── models/
│   └── Student.js          # Mongoose schema & validation
├── public/
│   ├── index.html          # Dashboard UI
│   ├── styles.css          # Blue & white responsive styles
│   └── app.js              # Frontend CRUD & search logic
├── routes/
│   └── studentRoutes.js    # Express REST API routes
├── .env.example            # Environment variable template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies & scripts
├── seed.js                 # Sample student records script
├── server.js               # Express app & MongoDB connection
└── README.md               # Project documentation
```

## Setup & Running Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on `mongodb://127.0.0.1:27017`

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default `.env` values:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/student_management_db
```

### 4. Load Sample Student Records (Optional)
```bash
npm run seed
```

### 5. Start the Application
```bash
npm start
```

Open your browser and visit:
- **Application URL**: `http://localhost:5000`
- **Health Check URL**: `http://localhost:5000/api/health`

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/students` | Get all students (supports `?search=query`) |
| `GET` | `/api/students/:id` | Get a single student by ID |
| `POST` | `/api/students` | Create a new student |
| `PUT` | `/api/students/:id` | Update a student by ID |
| `DELETE` | `/api/students/:id` | Delete a student by ID |
| `GET` | `/api/health` | Check MongoDB connection status |

## Instructions for Capturing Output Screenshots (For Assignment Submission)

1. Ensure MongoDB is running and start the server with `npm start`.
2. Open `http://localhost:5000` in Chrome or Edge (full-screen or clean browser window).
3. Capture the following screenshots using **Windows Snipping Tool** (`Win + Shift + S`):
   - **Screenshot 1 — Dashboard Home**: Full dashboard showing the sample student records and Total Students count.
   - **Screenshot 2 — Add Student & Success Message**: Fill in a new student, click **Add Student**, and capture the green success banner + newly added row.
   - **Screenshot 3 — Duplicate Enrollment Validation**: Try adding a student with an existing Enrollment Number and capture the red error message.
   - **Screenshot 4 — Search Functionality**: Type a name or enrollment number (e.g., `BT24`) in the search bar and capture the filtered results.
   - **Screenshot 5 — Edit & Update Student**: Click **Edit** on a row, modify a field (e.g., Semester or Section), click **Update Student**, and capture the updated record.
   - **Screenshot 6 — Delete Confirmation & Removal**: Click **Delete** on a row to capture the confirmation modal, confirm deletion, and capture the updated student count.
   - **Screenshot 7 — Terminal & Database Proof (Optional)**: Capture the terminal running `npm start` showing `MongoDB connected` and `Server is running at http://localhost:5000`.
