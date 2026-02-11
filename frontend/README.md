# Movie Recommendation System - Frontend

Modern, responsive React-based frontend for the Movie Recommendation System with AI-powered recommendations.

## 🎨 Features

- **Prime Video-inspired UI** with dark theme and cinematic design
- **AI Recommendation Engine** with multiple algorithms (Hybrid, TF-IDF, Cosine, SVD)
- **Personal Watchlist** with statistics and tracking
- **Advanced Search** with real-time results
- **Responsive Design** optimized for all devices
- **Smooth Animations** and modern interactions

## 🚀 Tech Stack

- **React 18** - UI library
- **React Router** - Navigation
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **CSS3** - Custom styling with gradients and animations

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

The frontend connects to the backend API at `http://localhost:3001` by default. Update the API base URL in `src/services/api.js` if needed.

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── MovieCard.jsx
│   ├── Navbar.jsx
│   └── ...
├── pages/          # Page components
│   ├── Homepage.jsx
│   ├── Recommendations.jsx
│   ├── Watchlist.jsx
│   └── ...
├── services/       # API services
│   └── api.js
├── css/            # Stylesheets
│   ├── Homepage.css
│   ├── Navbar.css
│   └── ...
└── App.jsx         # Main app component
```

## 🎯 Key Features

### Recommendation Algorithms
- **Hybrid**: Combines multiple algorithms for best results
- **TF-IDF**: Text-based similarity using movie descriptions
- **Cosine**: Genre and feature similarity
- **SVD**: Collaborative filtering based on user ratings

### Watchlist
- Save favorite movies
- Track statistics (total movies, genres, watch time)
- Sync with localStorage

### Search
- Real-time movie search
- Filter by title, genre, or keywords
- Clear search functionality

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001
```

## 📱 Responsive Breakpoints

- Desktop: > 900px
- Tablet: 768px - 900px
- Mobile: < 768px

## 🎨 Design System

- **Primary Color**: #ff3366 (Accent pink)
- **Background**: Dark gradients (#0d1117, #161b22)
- **Text**: #f0f6fc (Primary), #8b949e (Secondary)
- **Transitions**: 0.3s ease

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details
