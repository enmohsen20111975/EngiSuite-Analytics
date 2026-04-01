# EngiSuite Analytics - Node.js Full Stack Application

A complete Node.js full stack application ready for deployment on Hostinger.

## 🚀 Features

- **Express.js Backend** - RESTful API with TypeScript
- **Prisma ORM** - SQLite database with type-safe queries
- **Authentication** - JWT, Google OAuth, Telegram OAuth
- **Engineering Calculators** - Electrical, Mechanical, Civil
- **Workflow Engine** - Visual workflow builder with step execution
- **Equation Solver** - Engineering equation library
- **Analytics & VDA** - Visual Data Analysis tools
- **Learning Platform** - Courses, lessons, simulations, quizzes
- **Payment Integration** - Stripe & Paymob support
- **AI Integration** - DeepSeek, Qwen, Together AI

## 📁 Project Structure

```
engisuite-nodejs/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   └── server.ts          # Main server entry
├── client/                # React frontend (to be created)
├── public/                # Static files
├── uploads/               # File uploads
├── package.json
├── tsconfig.json
└── .env.example
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone and install dependencies:**
```bash
cd engisuite-nodejs
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Initialize database:**
```bash
npm run db:generate
npm run db:migrate
```

4. **Start development server:**
```bash
npm run dev
```

## 🌐 Deployment on Hostinger

### Option 1: Using Node.js Hosting

1. **Build the application:**
```bash
npm run build
```

2. **Upload to Hostinger:**
- Upload all files to your hosting directory
- Set `NODE_ENV=production` in environment variables
- Configure the startup command: `npm start`

3. **Configure port:**
Hostinger typically uses port 3000 or provides a custom port via `PORT` environment variable.

### Option 2: Using PM2 (Recommended)

1. **Install PM2:**
```bash
npm install -g pm2
```

2. **Create ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'engisuite-analytics',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

3. **Start with PM2:**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/telegram` - Telegram OAuth
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Calculators
- `GET /api/calculators` - List calculators
- `POST /api/calculators/:id` - Execute calculation

### Workflows
- `GET /api/workflows` - List workflows
- `GET /api/workflows/:id` - Get workflow
- `POST /api/workflows/:id/execute` - Execute workflow

### Equations
- `GET /api/equations` - List equations
- `POST /api/equations/:id/solve` - Solve equation

### Analytics
- `GET /api/analytics/datasets` - List datasets
- `POST /api/analytics/datasets` - Upload dataset
- `POST /api/analytics/query` - Execute query

### Learning
- `GET /api/learning/disciplines` - List disciplines
- `GET /api/learning/lesson/:id` - Get lesson
- `POST /api/learning/quiz/submit` - Submit quiz

### Payments
- `GET /api/payments/prices` - Get pricing
- `POST /api/payments/create-subscription` - Create subscription

### AI
- `POST /api/ai/chat` - AI chat
- `POST /api/ai/engineering-assistant` - Engineering AI

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 8000 |
| `FILE_DATA_MODE` | Run app with local TS/JSON data mode | false |
| `DATABASE_URL` | Database connection string | mysql://USER:PASSWORD@HOST:3306/DATABASE |
| `JWT_SECRET` | JWT signing secret | (required) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | (optional) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | (optional) |
| `STRIPE_SECRET_KEY` | Stripe API key | (optional) |
| `DEEPSEEK_API_KEY` | DeepSeek AI key | (optional) |

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request
