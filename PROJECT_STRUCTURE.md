# 📁 Project Structure

Complete overview of the Finance Dashboard project structure.

```
finance-dashboard/
│
├── public/
│   ├── index.html              # Main HTML file with Google Identity Services
│   └── manifest.json            # PWA manifest
│
├── src/
│   ├── components/
│   │   ├── Analytics/
│   │   │   └── Analytics.js     # Budget vs actual, trends, need vs want
│   │   │
│   │   ├── Auth/
│   │   │   └── Auth.js          # User selection and profile creation
│   │   │
│   │   ├── Charts/
│   │   │   ├── CategoryChart.js # Pie chart for category breakdown
│   │   │   ├── PaymentChart.js  # Bar chart for payment methods
│   │   │   └── TrendChart.js    # Line chart for monthly trends
│   │   │
│   │   ├── Dashboard/
│   │   │   └── Dashboard.js     # Main dashboard with summaries and charts
│   │   │
│   │   ├── ExpenseForm/
│   │   │   └── ExpenseForm.js   # Form to add new expenses
│   │   │
│   │   ├── GoogleSheet/
│   │   │   └── GoogleSheetConnect.js # Google Sheet connection setup
│   │   │
│   │   ├── History/
│   │   │   └── History.js       # Transaction history with filters
│   │   │
│   │   ├── Layout/
│   │   │   └── MainLayout.js    # Main app layout with navigation
│   │   │
│   │   └── Settings/
│   │       └── Settings.js      # User settings and preferences
│   │
│   ├── context/
│   │   └── AppContext.js        # Global state management
│   │
│   ├── services/
│   │   └── googleSheetsService.js # Google Sheets API integration
│   │
│   ├── utils/
│   │   └── helpers.js           # Utility functions
│   │
│   ├── App.js                   # Main app component
│   ├── index.js                 # React entry point
│   └── index.css                # Global styles with Tailwind
│
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── postcss.config.js            # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS configuration
│
├── README.md                    # Project overview and quick start
├── INSTALLATION.md              # Detailed installation guide
├── SETUP_GUIDE.md               # Google Cloud Console setup
└── PROJECT_STRUCTURE.md         # This file
```

## Component Hierarchy

```
App
└── AppProvider (Context)
    ├── Auth
    │   └── User Selection / Creation
    │
    └── MainLayout
        ├── Header (User info, Logout)
        ├── Navigation (Tabs)
        └── Content
            ├── GoogleSheetConnect
            ├── Dashboard
            │   ├── Summary Cards
            │   ├── CategoryChart
            │   ├── PaymentChart
            │   └── TrendChart
            ├── ExpenseForm
            ├── History
            │   └── Transaction Table
            ├── Analytics
            │   ├── Budget Comparison
            │   ├── Top Expenses
            │   ├── Need vs Want
            │   └── Monthly Comparison
            └── Settings
                ├── Categories
                ├── Cards
                ├── Payment Methods
                └── Monthly Income
```

## Data Flow

```
User Action
    ↓
Component
    ↓
AppContext (State)
    ↓
googleSheetsService
    ↓
Google Sheets API
    ↓
Google Sheet (Database)
    ↓
Response
    ↓
Update State
    ↓
Re-render Components
```

## Key Files Explained

### Core Files

**`src/App.js`**
- Main application component
- Handles authentication state
- Switches between Auth and MainLayout

**`src/context/AppContext.js`**
- Global state management using React Context
- Manages users, transactions, loading states
- Provides functions to save/switch users

**`src/services/googleSheetsService.js`**
- Google Sheets API integration
- OAuth authentication
- CRUD operations for transactions
- Sheet connection and header creation

### Component Files

**`src/components/Auth/Auth.js`**
- User profile selection
- New user creation
- Simple profile switcher (no passwords)

**`src/components/Layout/MainLayout.js`**
- Main app layout
- Navigation tabs
- Header with user info
- Mobile-responsive menu

**`src/components/GoogleSheet/GoogleSheetConnect.js`**
- Google OAuth login
- Sheet ID input and validation
- Connection testing
- Auto-create headers if empty

**`src/components/ExpenseForm/ExpenseForm.js`**
- Add new transactions
- Form validation
- Conditional card field
- Direct write to Google Sheet

**`src/components/Dashboard/Dashboard.js`**
- Monthly summary cards
- Category breakdown table/chart toggle
- Payment method analysis
- Monthly trend chart

**`src/components/History/History.js`**
- Transaction list with filters
- Edit transactions
- Delete transactions
- Month/category/payment filters

**`src/components/Analytics/Analytics.js`**
- Budget vs actual comparison
- Top 3 expenses
- Need vs want analysis
- Monthly comparison

**`src/components/Settings/Settings.js`**
- Manage categories
- Manage cards
- Manage payment methods
- Set monthly income

### Chart Components

**`src/components/Charts/CategoryChart.js`**
- Pie chart using Chart.js
- Shows category distribution
- Color-coded segments

**`src/components/Charts/PaymentChart.js`**
- Bar chart for payment methods
- Compares spending by payment type

**`src/components/Charts/TrendChart.js`**
- Line chart for monthly trends
- Shows spending over time

### Configuration Files

**`tailwind.config.js`**
- Tailwind CSS configuration
- Custom colors and theme
- Content paths for purging

**`postcss.config.js`**
- PostCSS configuration
- Tailwind and Autoprefixer plugins

**`.env`**
- Environment variables
- Google Client ID
- Not committed to git

## State Management

### AppContext State

```javascript
{
  currentUser: {
    name: string,
    sheetId: string,
    categories: string[],
    cards: string[],
    paymentMethods: string[],
    monthlyIncome: number,
    budgets: object
  },
  users: User[],
  transactions: Transaction[],
  isLoading: boolean
}
```

### Transaction Object

```javascript
{
  rowIndex: number,
  date: string,        // YYYY-MM-DD
  month: string,       // YYYY-MM
  category: string,
  subCategory: string,
  paymentMethod: string,
  cardName: string,
  amount: number,
  type: string,        // Expense|EMI|Investment|Savings
  notes: string
}
```

## API Integration

### Google Sheets API Endpoints

- **Get Sheet**: `GET /v4/spreadsheets/{sheetId}`
- **Get Values**: `GET /v4/spreadsheets/{sheetId}/values/{range}`
- **Update Values**: `PUT /v4/spreadsheets/{sheetId}/values/{range}`
- **Append Values**: `POST /v4/spreadsheets/{sheetId}/values/{range}:append`
- **Batch Update**: `POST /v4/spreadsheets/{sheetId}:batchUpdate`

### OAuth Scopes

- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive.file`

## Styling

### Tailwind CSS Classes Used

- **Layout**: `flex`, `grid`, `container`, `mx-auto`
- **Spacing**: `p-*`, `m-*`, `space-*`
- **Colors**: `bg-*`, `text-*`, `border-*`
- **Typography**: `font-*`, `text-*`
- **Responsive**: `md:*`, `lg:*`
- **Interactive**: `hover:*`, `focus:*`

### Custom Colors

```javascript
{
  primary: '#3b82f6',    // Blue
  secondary: '#8b5cf6',  // Purple
  success: '#10b981',    // Green
  danger: '#ef4444',     // Red
  warning: '#f59e0b'     // Orange
}
```

## Security Considerations

1. **OAuth 2.0**: Secure Google authentication
2. **No Backend**: Direct client-to-Google communication
3. **Local Storage**: User preferences only (no sensitive data)
4. **Private Sheets**: Users control sheet sharing
5. **No API Keys**: Only OAuth Client ID needed

## Performance Optimizations

1. **Code Splitting**: React lazy loading (can be added)
2. **Memoization**: React.memo for charts (can be added)
3. **Debouncing**: Form inputs (can be added)
4. **Caching**: Transaction data in state
5. **Lazy Loading**: Charts loaded on demand

## Future Enhancements

Potential features to add:

- [ ] Export data to CSV/PDF
- [ ] Recurring transactions
- [ ] Budget alerts
- [ ] Multiple sheet support per user
- [ ] Dark mode
- [ ] Offline support with PWA
- [ ] Receipt photo upload
- [ ] Category icons
- [ ] Custom date ranges
- [ ] Comparison with previous year

## Development Workflow

1. **Start Development**: `npm start`
2. **Make Changes**: Edit files in `src/`
3. **Test**: Check in browser at `localhost:3000`
4. **Build**: `npm run build` for production
5. **Deploy**: Upload `build/` folder

## Testing Strategy

Currently no tests included. Recommended:

- **Unit Tests**: Jest for utility functions
- **Component Tests**: React Testing Library
- **Integration Tests**: Test Google Sheets integration
- **E2E Tests**: Cypress for user flows

---

This structure provides a clean, maintainable, and scalable foundation for the Finance Dashboard.
