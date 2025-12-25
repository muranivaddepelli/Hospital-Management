# Sugar & Heart Clinic - Daily Checklist Management System

A production-ready MERN stack application for managing daily operational checklists in a healthcare facility.

![Daily Checklist System](./Screenshot%202025-12-25%20212623.png)

## 🏥 Overview

This system enables Sugar & Heart Clinic staff to manage daily operational checklists across different areas (Consultation Chambers, Reception, Laboratory, Pharmacy, Emergency Room). It features role-based access control with Admin and Staff roles.

## ✨ Features

### For All Users (Admin & Staff)
- **Daily Checklist Management**: View and update task completion status
- **Date Selection**: Navigate to any date to view/edit checklists
- **Area Filtering**: Filter tasks by specific areas
- **Real-time Status Updates**: Toggle task completion with timestamps
- **Staff Attribution**: Record staff name for each task completion
- **Auto-save**: Batch save changes

### Admin-Only Features
- **Data Export**: Download checklist data in CSV or PDF format
- **User Management**: Create, edit, activate/deactivate user accounts
- **Area Management**: Configure clinic areas
- **Task Management**: Create and manage checklist tasks
- **Reports & Analytics**: View completion statistics and trends

## 🔐 Role-Based Access Control

| Feature | Admin | Staff |
|---------|-------|-------|
| View/Update Checklist | ✅ | ✅ |
| Download Data (CSV/PDF) | ✅ | ❌ |
| Manage Users | ✅ | ❌ |
| Manage Areas | ✅ | ❌ |
| Manage Tasks | ✅ | ❌ |
| View Reports | ✅ | ❌ |

**Security**: Role enforcement exists on both frontend (UI hidden) and backend (403 Forbidden response).

## 🛠️ Tech Stack

### Frontend
- React 18 (Functional Components + Hooks)
- TanStack Query (React Query) for server state
- Axios for HTTP requests
- React Router v6 for routing
- Tailwind CSS for styling
- React Hot Toast for notifications
- React Icons

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing
- express-validator for input validation
- json2csv + pdfkit for exports

## 📁 Project Structure

```
├── client/                    # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Reusable UI components
│   │   │   └── layout/       # Layout components
│   │   ├── context/          # React Context (Auth)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # Request handlers
│   │   ├── middlewares/      # Auth, validation, error handling
│   │   ├── models/           # Mongoose schemas
│   │   ├── repositories/     # Data access layer
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utilities (seeder)
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd c:\hospital\requirement
```

2. **Backend Setup**
```bash
cd server
npm install
```

3. **Create server/.env file**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/daily-checklist
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

4. **Frontend Setup**
```bash
cd ../client
npm install
```

5. **Create client/.env file**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Running the Application

1. **Start MongoDB** (if running locally)
```bash
mongod
```

2. **Seed the Database** (first time only)
```bash
cd server
node src/utils/seeder.js
```

3. **Start the Backend**
```bash
cd server
npm run dev
```

4. **Start the Frontend** (in a new terminal)
```bash
cd client
npm start
```

5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clinic.com | admin123 |
| Staff | staff@clinic.com | staff123 |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/login | User login | Public |
| POST | /api/auth/register | Register user | Admin |
| GET | /api/auth/me | Get current user | Auth |
| POST | /api/auth/change-password | Change password | Auth |

### Checklists
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/checklists | Get checklist by date | Auth |
| GET | /api/checklists/statistics | Get completion stats | Auth |
| PUT | /api/checklists/entry/:taskId | Update single entry | Auth |
| POST | /api/checklists/save | Save all entries | Auth |
| GET | /api/checklists/export/csv | Export to CSV | Admin |
| GET | /api/checklists/export/pdf | Export to PDF | Admin |

### Areas (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/areas | Get all areas |
| GET | /api/areas/active | Get active areas |
| POST | /api/areas | Create area |
| PUT | /api/areas/:id | Update area |
| DELETE | /api/areas/:id | Delete area |
| PATCH | /api/areas/:id/toggle-status | Toggle status |

### Tasks (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| PATCH | /api/tasks/:id/toggle-status | Toggle status |

### Users (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get all users |
| POST | /api/users | Create user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |
| PATCH | /api/users/:id/toggle-status | Toggle status |

## 🔒 Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt with 12 salt rounds
3. **Role-Based Authorization**: Middleware-enforced access control
4. **Input Validation**: express-validator on all endpoints
5. **CORS Configuration**: Restricted to allowed origins
6. **Error Handling**: Centralized error responses without stack traces in production

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Aesthetic**: Clean, professional healthcare-focused design
- **Smooth Animations**: Page transitions and micro-interactions
- **Loading States**: Spinners and skeleton loaders
- **Toast Notifications**: Success/error feedback
- **Empty States**: Informative placeholders when no data

## 📝 Assumptions

1. Single clinic deployment (not multi-tenant)
2. Tasks are pre-configured by admin; staff only update completion status
3. Date-based checklists (one entry per task per day)
4. Staff can mark any task complete (no task assignment)
5. Historical data is preserved (no automatic cleanup)

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm start        # Start server
npm run dev      # Start with nodemon (auto-reload)
```

**Frontend:**
```bash
npm start        # Start development server
npm run build    # Production build
npm test         # Run tests
```

## 📄 License

This project is proprietary software developed for Sugar & Heart Clinic.

---

**Built with ❤️ for Sugar & Heart Clinic**

