# 💰 SplitEase - Smart Expense Sharing Application

<div align="center">

![SplitEase Logo](https://img.shields.io/badge/SplitEase-Expense%20Sharing-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PHBhdGggZD0iTTEyIDZWMTgiLz48cGF0aCBkPSJNOCAxMEgxNiIvPjxwYXRoIGQ9Ik04IDE0SDE2Ii8+PC9zdmc+)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

**A modern, full-stack expense sharing application that makes splitting bills and tracking group expenses effortless.**

[Live Demo](#) • [Features](#-features) • [Installation](#-installation) • [API Documentation](#-api-documentation)

</div>

---

## 📖 About

SplitEase is a comprehensive expense-sharing platform inspired by Splitwise, designed to simplify the process of splitting bills, tracking debts, and settling up with friends, roommates, or travel companions. Built with modern web technologies, it offers a seamless experience for managing shared expenses.

### Why SplitEase?

- 🎯 **Intuitive Interface** - Clean, modern dark theme with smooth animations
- ⚡ **Real-time Balance Updates** - See who owes whom instantly
- 🔐 **Secure Authentication** - JWT-based authentication with password hashing
- 📊 **Smart Debt Simplification** - Minimizes the number of transactions needed
- 📱 **Responsive Design** - Works beautifully on desktop and mobile

---

## ✨ Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| 👥 **Group Management** | Create groups for trips, roommates, events, or any shared expense scenario |
| 💳 **Expense Tracking** | Add expenses with descriptions, amounts, and payer information |
| ⚖️ **Flexible Splitting** | Split equally, by exact amounts, or by percentage |
| 📈 **Balance Dashboard** | Real-time overview of who owes what |
| 💸 **Settlement Recording** | Track payments and settle debts |
| 📧 **Email Notifications** | Get notified when expenses are added |

### Split Types

```
┌─────────────────────────────────────────────────────────────┐
│                    SPLIT OPTIONS                            │
├─────────────────────────────────────────────────────────────┤
│  ⚖️ EQUAL       │  Split evenly among all participants     │
│  💰 EXACT       │  Specify exact amount for each person    │
│  📊 PERCENTAGE  │  Divide by custom percentages            │
└─────────────────────────────────────────────────────────────┘
```

### Additional Features

- 🔍 **Search & Filter** - Quickly find expenses by description or payer
- 📥 **CSV Export** - Download expense reports for record-keeping
- 🏷️ **Categories** - Organize expenses (Food, Transport, Shopping, etc.)
- 📝 **Notes** - Add context to expenses
- 🗑️ **Expense Management** - Edit or delete expenses as needed
- 💡 **Smart Suggestions** - Optimal settlement recommendations

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **CSS3** - Custom styling with CSS variables
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js & Express** - REST API server
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### DevOps
- **Vercel** - Frontend & serverless deployment
- **Git & GitHub** - Version control

---

## 🚀 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aniruddha1701/Splitease-Expense-Sharing-.git
   cd Splitease-Expense-Sharing-
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure environment variables**
   
   Create `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm start

   # Terminal 2 - Start frontend
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user |
| `GET` | `/api/auth/me` | Get current user |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | Get all users |
| `POST` | `/api/users` | Create user (quick add) |
| `GET` | `/api/users/:id` | Get user by ID |
| `GET` | `/api/users/:id/balances` | Get user's balance summary |

### Group Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/groups` | Get all groups |
| `POST` | `/api/groups` | Create new group |
| `GET` | `/api/groups/:id` | Get group details |
| `POST` | `/api/groups/:id/members` | Add member to group |
| `GET` | `/api/groups/:id/expenses` | Get group expenses |
| `GET` | `/api/groups/:id/balances` | Get group balances |
| `GET` | `/api/groups/:id/settlements` | Get group settlements |

### Expense Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/expenses` | Create expense |
| `DELETE` | `/api/expenses/:id` | Delete expense |

### Settlement Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/settlements` | Record settlement |
| `DELETE` | `/api/settlements/:id` | Delete settlement |

---

## 📁 Project Structure

```
Splitease-Expense-Sharing/
├── api/
│   └── index.js           # Vercel serverless entry point
├── client/
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthPage.js      # Login/Register
│   │   │   ├── Dashboard.js     # Main dashboard
│   │   │   ├── Groups.js        # Group list
│   │   │   ├── GroupDetail.js   # Group details
│   │   │   ├── Users.js         # User management
│   │   │   └── SimplifyDebts.js # Debt optimization
│   │   ├── App.js         # Main app component
│   │   ├── index.js       # Entry point
│   │   └── index.css      # Global styles
│   └── package.json
├── server/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   ├── email.js       # Email templates
│   │   └── stripe.js      # Payment config
│   ├── middleware/
│   │   └── auth.js        # JWT authentication
│   ├── schemas/
│   │   ├── User.js        # User model
│   │   ├── Group.js       # Group model
│   │   ├── Expense.js     # Expense model
│   │   └── Settlement.js  # Settlement model
│   ├── index.js           # Express server
│   └── package.json
├── vercel.json            # Vercel configuration
├── package.json           # Root package.json
└── README.md
```

---

## 🎨 Screenshots

### Dashboard
The main dashboard provides an overview of your financial status with:
- Balance summary cards
- Recent activity feed
- Quick action buttons
- Spending breakdown by category

### Group Detail
View and manage group expenses with:
- Expense list with search/filter
- Balance tab showing who owes whom
- Settlement history
- Smart debt simplification suggestions

### Add Expense Modal
Easy expense entry with:
- Category selection (8 categories)
- Flexible split options
- Live split preview
- Optional notes

---

## 🔒 Security

- **Password Hashing**: All passwords are hashed using bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth with expiration
- **Input Validation**: All inputs are validated server-side
- **CORS Protection**: Configured for production origins
- **Environment Variables**: Sensitive data stored securely

---

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy!

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Aniruddha Patil**

- GitHub: [@Aniruddha1701](https://github.com/Aniruddha1701)

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ and ☕

</div>
