# Movie Recommendation System

A full-stack **Movie Recommendation System** with **ML-powered** Content-Based (TF-IDF + Cosine), Collaborative Filtering (SVD), and **Hybrid** recommendations — final-year project ready.

---

## Full folder structure (what you have)

```
ML Project/
│
├── README.md                    # This file + project overview
│
├── frontend/                    # React + Vite — UI only, separate from backend/ML
│   ├── index.html               # Entry HTML, loads main.jsx
│   ├── vite.config.js           # Vite config; proxies /api → backend :3001
│   ├── package.json             # Dependencies: react, react-dom, react-router-dom, vite
│   ├── public/
│   │   └── favicon.svg          # App icon
│   │
│   └── src/
│       ├── main.jsx             # React root; imports App + global.css
│       ├── App.jsx              # React Router routes (/, /search, /movie/:id, /recommendations)
│       │
│       ├── components/           # Reusable UI components
│       │   ├── Layout.jsx       # Header + nav (Home, Search, For You) + <Outlet />
│       │   └── MovieCard.jsx     # Single movie card (poster, title, meta); links to /movie/:id
│       │
│       ├── css/                 # External CSS — one file per component/page (no mixing)
│       │   ├── global.css       # :root vars, body, resets
│       │   ├── Layout.css       # Header, nav, main layout
│       │   ├── Homepage.css     # Hero, section, cards, loading
│       │   ├── Search.css       # Search input, results list
│       │   ├── MovieDetail.css  # Movie hero, similar-movies grid
│       │   ├── Recommendations.css  # User ID form, tabs (Hybrid/Content/CF), grid
│       │   └── MovieCard.css    # Card + poster + body styles
│       │
│       ├── pages/               # One component per route
│       │   ├── Homepage.jsx     # Hero + “Popular movies” from API
│       │   ├── Search.jsx      # Search input → API search → results
│       │   ├── MovieDetail.jsx # Movie by id + “Similar movies” (content-based)
│       │   └── Recommendations.jsx  # User ID + type (hybrid/content/collaborative) → API
│       │
│       └── services/
│           └── api.js           # All backend calls: getMovies, getMovieById, searchMovies,
│                                # getRecommendationsByMovie, getRecommendationsForUser
│
├── backend/                     # Node.js + Express — API only, no UI
│   ├── server.js                # Express app, CORS, mounts /api routes, listens :3001
│   ├── db.js                    # Reads JSON from data/ (movies, content_based, user_recommendations)
│   ├── package.json             # Dependencies: express, cors (no database)
│   │
│   ├── data/                    # Written by ML pipeline; backend only reads
│   │   ├── movies.json          # List of movies (id, title, overview, genres, release_year, poster_path, etc.)
│   │   ├── content_based.json   # { "movieId": [similar movie ids] } for “Similar movies”
│   │   ├── user_recommendations.json  # { "userId": { "hybrid", "content", "collaborative": [...] } }
│   │   └── .gitkeep
│   │
│   └── routes/
│       ├── movies.js            # GET /api/movies, /api/movies/:id, /api/movies/search
│       └── recommendations.js  # GET /api/recommendations/content-based/:movieId,
│                                #     /api/recommendations/user/:userId?type=hybrid|content|collaborative
│
└── ML/                          # Python — trains models and writes backend/data/
    ├── data/                    # Your inputs (you put CSVs here)
    │   ├── movies_cleaned.csv   # Movie metadata (title, overview, genres, release_date, etc.)
    │   ├── ratings.csv          # userId, movieId, rating, timestamp
    │   └── .gitkeep
    │
    ├── config.py                # Paths (CSV, backend/data), weights (0.6 content, 0.4 collab),
    │                             # N_FACTORS, MAX_USERS_TO_SAVE (e.g. 20k), TOP_N_*
    ├── content_based.py         # TF-IDF on genres+overview, cosine similarity → content_based.json + movies.json
    ├── collaborative_svd.py     # SVD on user–movie matrix → user_recommendations (collaborative only)
    ├── hybrid.py                # Merges content + collaborative → user_recommendations (hybrid, content, collaborative)
    ├── train_models.py          # Runs: content_based → collaborative_svd → hybrid (writes all to backend/data/)
    └── requirements.txt         # pandas, numpy, scikit-learn, scipy
```

---

## What each part does

| Part | Role |
|------|------|
| **frontend** | React SPA (Vite). Calls backend `/api` only. No direct access to ML or CSV. |
| **backend** | Serves JSON API. Reads only from `backend/data/*.json`. Does not run Python or read CSV. |
| **ML** | Reads CSV from `ML/data/`, runs algorithms, writes `backend/data/*.json`. Run manually (`python train_models.py`). |

---

## Data flow

1. **You** put `movies_cleaned.csv` and `ratings.csv` in `ML/data/`.
2. **ML** (`python train_models.py`) produces:
   - `backend/data/movies.json`
   - `backend/data/content_based.json`
   - `backend/data/user_recommendations.json`
3. **Backend** serves these via API (no DB; just file reads).
4. **Frontend** uses `services/api.js` → backend → gets movies, search, similar movies, user recommendations.

---

## CSS structure (no mixing)

- **global.css** — Variables (`--bg-dark`, `--accent`, etc.), body, resets. Imported once in `main.jsx`.
- **Layout.css** — Used only by `Layout.jsx` (header, nav, main wrapper).
- **Homepage.css** — Used only by `Homepage.jsx`.
- **Search.css** — Used only by `Search.jsx`.
- **MovieDetail.css** — Used only by `MovieDetail.jsx`.
- **Recommendations.css** — Used only by `Recommendations.jsx`.
- **MovieCard.css** — Used only by `MovieCard.jsx`.

Each component/page imports its own CSS file; no shared component CSS is mixed in one file.

---

## API endpoints (backend)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/movies?limit=24` | List movies (for home) |
| GET | `/api/movies/:id` | Single movie (for movie detail) |
| GET | `/api/movies/search?q=...` | Search by title/overview/genres |
| GET | `/api/recommendations/content-based/:movieId?limit=10` | Similar movies (content-based) |
| GET | `/api/recommendations/user/:userId?limit=20&type=hybrid` | For You (hybrid / content / collaborative) |

---

## ML pipeline (what each script does)

| Step | Script | Input | Output |
|------|--------|--------|--------|
| 1 | `content_based.py` | `movies_cleaned.csv` | `content_based.json`, `movies.json` |
| 2 | `collaborative_svd.py` | `ratings.csv` | Updates `user_recommendations.json` (collaborative only) |
| 3 | `hybrid.py` | `content_based.json` + current `user_recommendations.json` | `user_recommendations.json` (adds hybrid + content per user) |

**Algorithms:**  
- **Content-based:** TF-IDF on genres + overview → cosine similarity between movies.  
- **Collaborative:** TruncatedSVD on user–movie rating matrix; recommendations per user (top users limited by `MAX_USERS_TO_SAVE`).  
- **Hybrid:** `0.6 × content_score + 0.4 × collaborative_score` per item per user.

---

## ML algorithms (final-year mapping)

| CSV | Task | Algorithm |
|-----|------|-----------|
| movies_cleaned.csv | Content similarity | TF-IDF + Cosine |
| ratings.csv | User preference | SVD (matrix factorization) |
| Both | Hybrid | 0.6×Content + 0.4×Collaborative |

**One-line viva:**  
*"We use TF-IDF with cosine similarity on movie metadata and matrix factorization (SVD) on user ratings, combining both in a hybrid recommendation system."*

---

## How to run

1. **CSV in place:** `ML/data/movies_cleaned.csv`, `ML/data/ratings.csv`
2. **ML:** `cd ML` → `pip install -r requirements.txt` → `python train_models.py`
3. **Backend:** `cd backend` → `npm install` → `npm run dev` (http://localhost:3001)
4. **Frontend:** `cd frontend` → `npm install` → `npm run dev` (http://localhost:5173)

Frontend proxies `/api` to the backend, so you only open http://localhost:5173 in the browser.

---

## Tech stack summary

| Part | Tech |
|------|------|
| Frontend | React 18, Vite 5, React Router 6, external CSS |
| Backend | Node.js, Express, JSON files in `backend/data/` |
| ML | Python, pandas, scikit-learn (TF-IDF, cosine, TruncatedSVD), scipy |
