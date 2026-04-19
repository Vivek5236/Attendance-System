# 📋 Real-Time Attendance Management System

A full-stack MERN application for managing employee attendance with role-based access, selfie capture, geolocation, overtime management, and report exports.

---

## 🚀 Features

- **JWT Auth** with role-based access (Employee / Manager / Admin)
- **Punch In** with live webcam selfie (browser WebRTC API) + geolocation
- **Punch Out** with automatic working hours calculation
- **Working Hours Indicator**: `completed` (≥8h) | `incomplete` (<8h)
- **Overtime Requests**: Employee requests → Manager/Admin approves/rejects
- **Dashboards** tailored per role
- **Reports** with date range + user filters
- **Export** to PDF and Excel
- **Redux Toolkit + RTK Query** for state management and API calls

---

## 🧱 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite                     |
| State      | Redux Toolkit + RTK Query           |
| Backend    | Node.js + Express.js                |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT (jsonwebtoken + bcryptjs)       |
| Logging    | Morgan                              |
| PDF Export | PDFKit                              |
| Excel Export | ExcelJS                           |

---

## 📁 Folder Structure

```
attendance-system/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # signup, login, getMe
│   │   ├── attendanceController.js # punch-in, punch-out, queries
│   │   ├── overtimeController.js  # request, review OT
│   │   ├── userController.js      # user CRUD (admin)
│   │   └── reportController.js    # report data + PDF/Excel export
│   ├── middleware/
│   │   └── authMiddleware.js      # protect + authorize
│   ├── models/
│   │   ├── User.js                # name, email, password, role
│   │   ├── Attendance.js          # punchIn/Out, selfie, location, hours
│   │   └── Overtime.js            # OT request with status
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── overtimeRoutes.js
│   │   ├── userRoutes.js
│   │   └── reportRoutes.js
│   ├── utils/
│   │   ├── generateToken.js       # JWT generation
│   │   └── dateHelper.js          # date utilities
│   ├── server.js                  # Express entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── features/
    │   │   └── auth/
    │   │       └── authSlice.js   # Redux auth state
    │   ├── services/
    │   │   ├── authApi.js         # RTK Query: login, signup
    │   │   ├── attendanceApi.js   # RTK Query: punch-in/out, queries
    │   │   ├── overtimeApi.js     # RTK Query: OT CRUD
    │   │   ├── userApi.js         # RTK Query: user management
    │   │   └── reportApi.js       # RTK Query: reports
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── AppLayout.jsx  # Sidebar + nav
    │   │   └── attendance/
    │   │       ├── PunchPanel.jsx # Punch in/out with live clock
    │   │       └── WebcamCapture.jsx # Webcam selfie modal
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── LoginPage.jsx
    │   │   │   └── SignupPage.jsx
    │   │   ├── employee/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── MyAttendance.jsx
    │   │   │   └── MyOvertime.jsx
    │   │   ├── manager/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── TeamAttendance.jsx
    │   │   │   └── OvertimeRequests.jsx
    │   │   ├── admin/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── AllUsers.jsx
    │   │   │   ├── AllAttendance.jsx
    │   │   │   └── AllOvertime.jsx
    │   │   └── ReportsPage.jsx    # Shared report + export
    │   ├── App.jsx                # Routes + role guards
    │   ├── store.js               # Redux store
    │   ├── main.jsx               # Entry point
    │   └── index.css              # Global styles
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd attendance-system
```

### 2. Backend setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend setup
```bash
cd ../frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api  (already set for local dev via Vite proxy)
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/attendance_db
JWT_SECRET=your_32+_char_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api
```
> In production, set `VITE_API_URL` to your Render backend URL.

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint         | Access  | Description       |
|--------|-----------------|---------|-------------------|
| POST   | /api/auth/signup | Public  | Register user     |
| POST   | /api/auth/login  | Public  | Login user        |
| GET    | /api/auth/me     | Private | Get current user  |

### Attendance
| Method | Endpoint                | Access           | Description               |
|--------|------------------------|------------------|---------------------------|
| POST   | /api/attendance/punch-in | Employee        | Punch in with selfie+location |
| PUT    | /api/attendance/punch-out | Employee       | Punch out                 |
| GET    | /api/attendance/today   | All              | Today's status            |
| GET    | /api/attendance/my      | All              | Own attendance history    |
| GET    | /api/attendance/all     | Manager/Admin    | Team or all attendance    |

### Overtime
| Method | Endpoint                    | Access          | Description         |
|--------|-----------------------------|-----------------|---------------------|
| POST   | /api/overtime/request       | Employee        | Request OT          |
| GET    | /api/overtime/my            | Employee        | Own OT requests     |
| GET    | /api/overtime/pending       | Manager/Admin   | Pending requests    |
| GET    | /api/overtime/all           | Manager/Admin   | All OT requests     |
| PUT    | /api/overtime/:id/review    | Manager/Admin   | Approve/Reject OT   |

### Users
| Method | Endpoint          | Access  | Description      |
|--------|------------------|---------|------------------|
| GET    | /api/users        | Admin   | All users        |
| GET    | /api/users/team   | Manager | Team members     |
| GET    | /api/users/managers | Admin | All managers    |
| PUT    | /api/users/:id    | Admin   | Update user      |

### Reports
| Method | Endpoint                   | Access  | Description            |
|--------|---------------------------|---------|------------------------|
| GET    | /api/reports/attendance   | All     | Attendance report data |
| GET    | /api/reports/export/pdf   | All     | Download PDF report    |
| GET    | /api/reports/export/excel | All     | Download Excel report  |

---

## 🚀 Deployment

### Backend → Render
1. Push backend folder to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add all environment variables from `.env`
6. Deploy

### Frontend → Vercel
1. Push frontend folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set **Framework**: Vite
4. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com/api`
5. Deploy

---

## 📌 Assumptions

1. **One punch-in per day per employee** — duplicate punch-ins on same date are rejected.
2. **Selfie is stored as base64** in MongoDB. For production, use AWS S3 or Cloudinary.
3. **Standard work hours = 8**. Status is `completed` if ≥8h, else `incomplete`.
4. **Manager sees only their direct reports** (employees with `managerId` pointing to them).
5. **Overtime is linked to an attendance record** — must punch out before requesting OT.
6. **Geolocation is optional** — punch-in proceeds if user denies location permission.
7. **Roles are set at signup** — Admin can change roles via the Users management page.
8. **No email verification** — simplified for demo purposes.

---

## 👤 Default Test Accounts

After running the app, create accounts via the `/signup` page with these roles:
- **Admin**: role = `admin`
- **Manager**: role = `manager`
- **Employee**: role = `employee` (set `managerId` via Admin → Users after creation)
