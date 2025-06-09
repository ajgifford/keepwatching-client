# KeepWatching Client

A modern React-based web application for tracking your favorite TV shows and movies. Never lose track of what you're watching or what episode you're on again!

## Features

### 🎬 Content Management
- **TV Show Tracking**: Mark episodes as watched, track your progress through seasons
- **Movie Management**: Build your movie watchlist and track what you've seen
- **Watch Status**: Track shows as "Not Watched", "Watching", "Up to Date", or "Watched"
- **Episode Progress**: See exactly which episodes you've watched and which are next

### 👨‍👩‍👧‍👦 Multi-Profile Support
- **Family Profiles**: Create separate profiles for each family member
- **Individual Progress**: Each profile maintains its own watch history and preferences
- **Profile Statistics**: Detailed viewing statistics for each profile

### 🔍 Discovery & Search
- **Content Discovery**: Find trending shows and movies by streaming service
- **Advanced Search**: Search for shows and movies with filters for year, genre, and more
- **Similar Content**: Get recommendations based on what you're already watching
- **Streaming Integration**: See which services have your content

### 📊 Statistics & Insights
- **Viewing Analytics**: Track your watching habits with detailed statistics
- **Progress Charts**: Visual representation of your viewing progress
- **Genre Analysis**: See your favorite genres and viewing patterns
- **Account Overview**: Account-wide statistics across all profiles

### 🎯 Smart Features
- **Keep Watching**: Quick access to your next episodes to watch
- **Upcoming Episodes**: See when new episodes of your shows are airing
- **Recent Releases**: Stay up to date with newly released content
- **Firebase Authentication**: Secure login with email/password or Google

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Material-UI (MUI)** for component library and theming
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Recharts** for data visualization

### Backend Integration
- **Firebase Authentication** for user management
- **Axios** for API communication
- **Socket.io** for real-time updates
- **TMDB API** integration for movie/TV data

### Development Tools
- **ESLint** with TypeScript support
- **Prettier** for code formatting
- **Create React App** for build tooling

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- Yarn package manager
- Firebase project for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd keepwatching-client
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   REACT_APP_API_URL=http://localhost:3033/api/v1
   REACT_APP_SOCKET_URL=ws://localhost:3033/
   REACT_APP_STATIC_CONTENT_URL=http://localhost:3033
   ```

4. **Start the development server**
   ```bash
   yarn start
   ```

The application will open at `http://localhost:3000`.

## Available Scripts

### Development
- `yarn start` - Start the development server
- `yarn build` - Build the app for production
- `yarn test` - Run the test suite

### Code Quality
- `yarn lint` - Run ESLint to check for code issues
- `yarn lint:fix` - Automatically fix ESLint issues
- `yarn format` - Format code with Prettier

## Project Structure

```
src/
├── app/                          # Redux store and global state
│   ├── api/                     # API configuration and axios setup
│   ├── constants/               # App-wide constants and filters
│   ├── model/                   # TypeScript type definitions
│   ├── slices/                  # Redux slices for state management
│   └── hooks.ts                 # Custom Redux hooks
├── components/                   # React components
│   ├── common/                  # Reusable components
│   │   ├── account/            # Account management components
│   │   ├── media/              # Media cards and favoriting
│   │   ├── movies/             # Movie-specific components
│   │   ├── search/             # Search functionality
│   │   ├── shows/              # TV show components
│   │   ├── statistics/         # Analytics and charts
│   │   └── tabs/               # Tab panel components
│   ├── navigation/             # Routing and navigation
│   ├── notification/           # Toast and system notifications
│   ├── pages/                  # Main page components
│   └── utility/                # Helper functions and utilities
└── resources/                   # Static assets and images
```

## Key Features Breakdown

### Authentication Flow
- Firebase Authentication with email/password and Google OAuth
- Automatic account creation and profile setup
- Email verification support
- Secure token-based API communication

### Content Management
- Integration with TMDB for comprehensive movie/TV data
- Real-time watch status updates via WebSocket
- Hierarchical tracking (Show → Season → Episode)
- Bulk operations for marking seasons/shows as watched

### Profile System
- Multiple profiles per account with isolated watch data
- Profile-specific statistics and recommendations
- Image upload for profile customization
- Default profile settings

### Search & Discovery
- Multi-criteria search with sorting options
- Trending content discovery
- Service-specific filtering (Netflix, Disney+, etc.)
- Content type filtering (movies vs. TV shows)

### Statistics Dashboard
- Watch progress visualization
- Genre and streaming service distribution
- Account-wide and profile-specific analytics
- Interactive charts and progress bars

## Configuration

### Firebase Setup
1. Create a Firebase project at https://firebase.google.com/
2. Enable Authentication with Email/Password and Google providers
3. Copy your Firebase config into the environment variables

### API Integration
The client expects a backend API running on port 3033 by default. The API should provide:
- User authentication endpoints
- Content management (shows, movies, episodes)
- Profile management
- Statistics and analytics
- WebSocket support for real-time updates

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow the existing ESLint and Prettier configuration
- Write meaningful component and function names
- Include JSDoc comments for complex functions

### Component Guidelines
- Use functional components with hooks
- Implement proper error handling and loading states
- Follow Material-UI design patterns
- Ensure responsive design for mobile devices

### State Management
- Use Redux Toolkit for global state
- Create focused slices for different feature areas
- Implement proper async thunk error handling
- Cache data appropriately with localStorage

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Lazy loading for route-based code splitting
- Image optimization with TMDB's responsive image URLs
- Efficient Redux state updates with normalized data
- Virtual scrolling for large content lists
- WebSocket connections for real-time updates

## Deployment

### Production Build
```bash
yarn build
```

The build folder contains the optimized production build ready for deployment.

### Environment Variables
Ensure all required environment variables are set in your production environment:
- Firebase configuration
- API endpoints
- Static content URLs

## Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**
   - Verify Firebase configuration in environment variables
   - Check that authentication providers are enabled in Firebase console

2. **API Connection Issues**
   - Ensure backend API is running and accessible
   - Verify CORS settings if running on different domains

3. **Build Failures**
   - Clear node_modules and reinstall dependencies
   - Check for TypeScript compilation errors

### Development Tips

- Use Redux DevTools Extension for debugging state changes
- Enable React Developer Tools for component inspection
- Check browser console for detailed error messages
- Use network tab to debug API communication

## License

This project is private and proprietary.

## Support

For technical issues or feature requests, please contact the development team.