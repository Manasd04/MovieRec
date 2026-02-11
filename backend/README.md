# Movie Recommendation System - Backend

Node.js/Express backend API for the Movie Recommendation System with ML integration.

## 🚀 Features

- **RESTful API** for movie data and recommendations
- **ML Integration** with Python-based recommendation engines
- **In-Memory Database** for fast movie lookups
- **Multiple Recommendation Types**:
  - Content-based (TF-IDF, Cosine similarity)
  - Collaborative filtering (SVD)
  - Hybrid recommendations
- **User Authentication** (JWT-based)
- **ML Status Monitoring** endpoint

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **ES Modules** - Modern JavaScript syntax

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 🔧 Configuration

The backend runs on `http://localhost:3001` by default. Configure via environment variables:

```env
PORT=3001
NODE_ENV=development
```

## 📁 Project Structure

```
backend/
├── controllers/        # Request handlers
│   ├── movieController.js
│   ├── recommendationController.js
│   └── authController.js
├── routes/            # API routes
│   ├── movies.js
│   ├── recommendations.js
│   ├── auth.js
│   └── ml_status.js
├── data/              # Data files
│   ├── movies.json
│   ├── content_based.json
│   └── user_recommendations.json
├── scripts/           # Utility scripts
│   └── mongodb_import.js
├── db.js              # Database initialization
└── server.js          # Main server file
```

## 🌐 API Endpoints

### Movies
- `GET /api/movies` - Search movies
- `GET /api/movies/:id` - Get movie by ID

### Recommendations
- `GET /api/recommendations/content-based/:movieId` - Content-based recommendations
- `GET /api/recommendations/user/:userId` - User-based recommendations

### ML Status
- `GET /api/ml/status` - Check ML model status and data freshness

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

## 📊 Data Files

The backend loads recommendation data from JSON files:

- **movies.json**: Movie metadata (title, genres, ratings, etc.)
- **content_based.json**: Pre-computed content-based recommendations
- **user_recommendations.json**: User-based collaborative recommendations

## 🔄 ML Integration

The backend integrates with Python ML scripts in the `../ML` directory:

1. Python scripts train models and generate recommendation files
2. Backend loads these files into memory on startup
3. API endpoints serve recommendations from in-memory data

## 🚦 Development

```bash
# Run in development mode with auto-reload
npm run dev

# Test API endpoints
curl http://localhost:3001/api/movies?q=inception
curl http://localhost:3001/api/recommendations/content-based/1?limit=10
curl http://localhost:3001/api/ml/status
```

## 📝 Notes

- Debug files (`debug_*.js`, `explore_*.js`) are excluded from version control
- Large data files should be regenerated using ML scripts
- The in-memory database provides fast lookups without external dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details
