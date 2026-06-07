 # Pathology Lab CRM

A real-time pathology laboratory management system. Built this for a client who needed to digitize their lab operations - handles everything from patient registration to billing and reports.

## What it does

This system manages the complete workflow of a pathology lab:

- Patient registration and management
- Test ordering and tracking
- Billing with UPI QR codes
- Real-time reports and analytics
- Staff management
- Patient portal for test results

The frontend is React with real-time updates via WebSockets. Backend is Node.js with MongoDB.

## Getting started

### Prerequisites

You'll need:

- Node.js (16+)
- MongoDB (4.4+)
- Git

### Installation

Clone and install dependencies:

```bash
git clone <repo-url>
cd pathology-crm

# Server setup
cd server
npm install
```

**Server dependencies:**

```bash
npm install express mongoose jsonwebtoken bcryptjs dotenv cors axios socket.io
npm install -D nodemon
```

```bash
# Client setup
cd ../client
npm install
```

**Client dependencies:**

```bash
npm install react react-dom react-router-dom axios lucide-react qr-code-styling socket.io-client
npm install -D @vitejs/plugin-react vite tailwindcss autoprefixer postcss
```

If you're setting up from scratch without package.json files, run the individual install commands above.

### Environment setup

Copy the example env file and configure:

```bash
cd server
cp .env.example .env
```

Edit `.env`:

```
MONGODB_URI=mongodb://localhost:27017/pathology-crm
JWT_SECRET=your-secret-key-here
PORT=5000
```

**Generate a secure JWT_SECRET key:**

For production, generate a strong random key instead of using the default:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (using Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated key and paste it as your `JWT_SECRET` in `.env`. Example:

```
JWT_SECRET=a7f3c9e2b1d4f6a8c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3f5a7c9
```

Make sure MongoDB is running on your machine.

### Database seeding

Run these to populate with test data:

```bash
cd server

# Basic tests and categories
node scripts/seed.js

# Sample patients with test history
node scripts/seed-patient-data.js
```

This creates 5 test patients and various registrations with different statuses.

### Running the app

Start both servers:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

App runs on `http://localhost:5173`

## Login credentials

**Staff/Admin:**

- Username: `admin`
- Password: `admin123`

**Test patients:**

- Rahul Sharma / 9876543210
- Priya Patel / 9876543211
- Amit Kumar / 9876543212
- Sneha Reddy / 9876543213
- Vikram Singh / 9876543214

## Key features

### For lab staff

- **Patient management** - Register new patients, search existing ones
- **Test registration** - Create test orders with billing
- **Search & filters** - Find registrations by patient, date, status etc
- **Reports** - Daily summaries, date ranges, payment breakdowns
- **Device requests** - Track lab equipment requests
- **Real-time updates** - See changes instantly across all users

### For patients

- **Dashboard** - View test history and status
- **Profile management** - Update contact info
- **Lab status** - Check if lab is open

### Technical stuff

- **Real-time sync** - WebSocket connections for live updates
- **QR payments** - Generate UPI QR codes for payments
- **WhatsApp integration** - Send test details to patients
- **Role-based access** - Different permissions for admin/staff/patients
- **Responsive design** - Works on mobile and desktop

## Project structure

```
pathology-crm/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React contexts
│   │   ├── pages/          # Main pages
│   │   ├── services/       # API calls
│   │   └── main.jsx
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── middleware/         # Auth middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── scripts/            # Database seeds
│   └── server.js
│
└── README.md
```

## API overview

Main endpoints:

```
POST /api/auth/login              # Staff login
POST /api/auth/patient-login      # Patient login

GET  /api/registration/search     # Search registrations
POST /api/registration           # Create registration
PUT  /api/registration/:id       # Update registration
DELETE /api/registration/:id     # Delete registration (admin only)

GET /api/reports/daily-summary    # Daily reports
GET /api/reports/date-range       # Date range reports

GET /api/patient-portal/my-tests  # Patient test history
```

## Real-time features

Uses Socket.IO for live updates. When someone creates/updates a registration, all connected users see the changes immediately.

Socket rooms:

- `reports` - Report updates
- `registrations` - Registration changes
- `patients` - Patient updates
- `staff` - Staff management
- `device-requests` - Device request updates

## Development notes

### Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, Socket.IO client
- **Backend:** Node.js, Express, MongoDB, Socket.IO
- **Auth:** JWT tokens
- **Icons:** Lucide React
- **QR codes:** qr-code-styling

### Database models

- `User` - Staff and patient accounts
- `Patient` - Patient information
- `Registration` - Test registrations
- `Test` - Available tests
- `DeviceRequest` - Equipment requests
- `Settings` - Lab configuration

### Seed scripts

- `seed.js` - Basic tests and categories
- `seed-patient-data.js` - Sample patients with history
- `seed-device-requests.js` - Sample device requests
- `seed-simple.js` - Minimal data for testing

## Common issues

**MongoDB connection fails:**
Make sure MongoDB service is running. On Windows: `net start MongoDB`

**Port 5000 in use:**
Change PORT in `.env` or kill the process using that port

**Real-time updates not working:**
Check browser console for WebSocket connection errors. Make sure both server and client are running.

**Module not found errors:**
Run `npm install` in the affected directory (server or client)

## Production deployment

For production:

1. Set proper environment variables
2. Build the client: `cd client && npm run build`
3. Serve client build files from Express
4. Use PM2 or similar for process management
5. Set up MongoDB with proper authentication
6. Configure reverse proxy (nginx) if needed

## Contributing

The codebase is fairly straightforward. Main areas:

- **Frontend pages** in `client/src/pages/`
- **API routes** in `server/routes/`
- **Database models** in `server/models/`
- **Real-time logic** in Socket.IO handlers

Feel free to submit issues or PRs.

---

Built this over a few weeks for a pathology lab that was still using paper records. The real-time features were crucial since multiple staff members needed to see updates instantly. The patient portal was an afterthought but turned out to be really useful for reducing phone calls about test results.
