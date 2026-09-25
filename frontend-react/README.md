# EngiSuite React Frontend

Modern React frontend for EngiSuite Analytics, built with Vite, React 19, Tailwind CSS, and Zustand.

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **TanStack Query** - Server state management
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/          # App layout components (Sidebar, Header, AppLayout)
│   └── ui/              # Reusable UI components (Button, Card, Input, etc.)
├── lib/
│   └── utils.js         # Utility functions (cn, formatNumber, etc.)
├── pages/
│   ├── DashboardPage.jsx
│   ├── LoginPage.jsx
│   └── PlaceholderPage.jsx
├── router/
│   └── index.jsx        # React Router configuration
├── services/
│   ├── apiClient.js     # Centralized Axios client
│   └── authService.js   # Authentication service
├── stores/
│   ├── authStore.js     # Auth state with Zustand
│   └── themeStore.js    # Theme state with Zustand
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles with Tailwind
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=EngiSuite Analytics
VITE_ENABLE_MOCK_DATA=false
```

## Features

### Authentication
- Login/Register pages
- Token-based authentication
- Protected routes with auth guards
- Persistent sessions with localStorage

### Theme
- Light/Dark/System theme support
- Persisted theme preference
- System preference detection

### UI Components
- Button (primary, secondary, ghost, danger, outline variants)
- Card (with header, content, footer)
- Input (text, email, password)
- Textarea
- Select
- Modal
- Loader/Spinner
- EmptyState
- ErrorState

### Layout
- Responsive sidebar (collapsible on desktop)
- Mobile navigation
- Header with search, notifications, user menu

## API Integration

The frontend connects to the FastAPI backend. All API calls go through the centralized `apiClient`:

```javascript
import { api } from './services/apiClient';

// GET request
const data = await api.get('/api/endpoint');

// POST request
const result = await api.post('/api/endpoint', { data });
```

## Development

### Linting

```bash
npm run lint
```

### Formatting

```bash
npx prettier --write "src/**/*.{js,jsx}"
```

## Migration Status

| Page | Status |
|------|--------|
| Dashboard | ✅ Complete |
| Login | ✅ Complete |
| Calculators | 🚧 Placeholder |
| Pipelines | 🚧 Placeholder |
| Visual Workflow | 🚧 Placeholder |
| Reports | 🚧 Placeholder |
| Learning | 🚧 Placeholder |
| Pricing | 🚧 Placeholder |
| Profile | 🚧 Placeholder |
| Settings | 🚧 Placeholder |

## License

MIT
