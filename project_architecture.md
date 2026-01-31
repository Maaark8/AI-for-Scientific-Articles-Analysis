# Project Architecture: Prime Time Medical Research

## Overview

Prime Time Medical Research is an AI-powered platform for analyzing scientific research opportunities in medical literature. It combines PubMed data retrieval, NLP-based keyword extraction, semantic analysis, and machine learning to help researchers identify promising research directions.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              SvelteKit Frontend (TypeScript)                 │    │
│  │  - Dashboard with search form                               │    │
│  │  - Articles browser with pagination                         │    │
│  │  - Analysis page with opportunity scoring                   │    │
│  │  - Responsive design with Tailwind CSS                      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │ HTTP/REST                            │
│                              ▼                                      │
├─────────────────────────────────────────────────────────────────────┤
│                          API LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │               FastAPI Backend (Python)                       │    │
│  │  - REST endpoints for all operations                        │    │
│  │  - Background task processing                               │    │
│  │  - CORS middleware for cross-origin requests                │    │
│  │  - Auto-generated OpenAPI documentation                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                      │
│              ┌───────────────┼───────────────┐                      │
│              ▼               ▼               ▼                      │
├─────────────────────────────────────────────────────────────────────┤
│                        SERVICE LAYER                                 │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────────┐    │
│  │   ML/AI     │  │  Data Fetching  │  │  Database Manager    │    │
│  │  Pipeline   │  │    Services     │  │                      │    │
│  │             │  │                 │  │                      │    │
│  │ - KeyBERT   │  │ - PubMed API    │  │ - PostgreSQL ops     │    │
│  │ - PubMedBERT│  │ - MeSH Expander │  │ - Article storage    │    │
│  │ - HDBSCAN   │  │ - CrossRef      │  │ - Vector storage     │    │
│  │ - UMAP      │  │ - OpenAlex      │  │ - Search history     │    │
│  │ - ARIMA     │  │                 │  │                      │    │
│  └─────────────┘  └─────────────────┘  └──────────────────────┘    │
│                              │                                      │
│                              ▼                                      │
├─────────────────────────────────────────────────────────────────────┤
│                        DATA LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                PostgreSQL Database                           │    │
│  │  - Articles with metadata                                   │    │
│  │  - Semantic vectors (768-dim embeddings)                    │    │
│  │  - Search history and scores                                │    │
│  │  - Citation tracking per year                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
Proiect-AI/
├── src/                          # Backend Python source
│   ├── main_api.py               # FastAPI application entry point
│   ├── db_manager.py             # Database operations class
│   ├── database_reset.py         # Database initialization script
│   ├── init_db.sql               # SQL schema definitions
│   ├── pubmed_fetcher.py         # PubMed API integration
│   ├── mesh_expander.py          # MeSH vocabulary expansion
│   ├── clustering.py             # HDBSCAN/UMAP clustering pipeline
│   ├── forecast.py               # ARIMA time-series forecasting
│   ├── opportunity_score.py      # Scoring algorithms
│   └── main.py                   # Legacy/alternative entry point
│
├── frontend/                     # SvelteKit frontend
│   ├── src/
│   │   ├── routes/               # Page components
│   │   │   ├── +page.svelte      # Dashboard/home
│   │   │   ├── +layout.svelte    # App layout
│   │   │   ├── articles/         # Articles browser
│   │   │   └── analysis/         # Analysis page
│   │   └── lib/
│   │       ├── api.ts            # API client
│   │       ├── types.ts          # TypeScript types
│   │       ├── stores.ts         # Svelte stores
│   │       └── components/       # Reusable components
│   ├── static/                   # Static assets
│   ├── package.json              # Node.js dependencies
│   └── vite.config.ts            # Vite configuration
│
├── requirements_api.txt          # Python dependencies
├── start_api.py                  # API startup script
├── .env                          # Environment variables
├── .env.example                  # Environment template
└── README.md                     # Project documentation
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌───────────────────┐       ┌──────────────┐
│   articles   │◄──────┤ articles_authors  ├──────►│   authors    │
├──────────────┤       └───────────────────┘       ├──────────────┤
│ id (PK)      │                                   │ id (PK)      │
│ pmid         │       ┌───────────────────┐       │ full_name    │
│ title        │◄──────┤  search_articles  │       └──────────────┘
│ abstract     │       └───────────────────┘               │
│ doi          │               │                           │
│ journal      │               │                           ▼
│ pub_date     │               │                   ┌──────────────┐
└──────────────┘               ▼                   │ affiliations │
       │               ┌───────────────────┐       ├──────────────┤
       │               │     searches      │       │ id (PK)      │
       │               ├───────────────────┤       │ author_id    │
       │               │ search_id (PK)    │       │ institution  │
       │               │ idea_text         │       │ country      │
       │               │ keyword_text      │       │ city         │
       │               │ max_results       │       └──────────────┘
       │               │ timestamp         │
       │               └───────────────────┘
       │                       │
       ▼                       ▼
┌──────────────┐       ┌───────────────────┐
│  citations   │       │opportunity_scores │
├──────────────┤       ├───────────────────┤
│ id (PK)      │       │ search_id (PK/FK) │
│ article_id   │       │ novelty_score     │
│ source       │       │ citation_velocity │
│ count        │       │ recency_score     │
│ last_update  │       │ overall_score     │
└──────────────┘       │ computed_at       │
       │               └───────────────────┘
       ▼
┌──────────────────┐   ┌───────────────────┐
│citations_per_year│   │  article_vectors  │
├──────────────────┤   ├───────────────────┤
│ id (PK)          │   │ article_id (PK)   │
│ article_id (FK)  │   │ vector (768-dim)  │
│ year             │   │ cluster_label     │
│ citation_count   │   └───────────────────┘
└──────────────────┘
                       ┌───────────────────┐
                       │     clusters      │
                       ├───────────────────┤
                       │ cluster_label (PK)│
                       │ centroid          │
                       │ size              │
                       │ velocity          │
                       │ last_updated      │
                       └───────────────────┘
```

---

## API Endpoints

### Keywords
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/keywords/generate` | Generate keywords from research idea using PubMedBERT |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/search/pubmed` | Search PubMed, store articles, trigger background analysis |
| GET | `/searches` | Get paginated search history |

### Articles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/articles` | Get all articles with pagination |
| GET | `/articles/{pmid}` | Get detailed article by PMID |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search/{search_id}/scores` | Get opportunity scores for a search |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/database/status` | Database connection status |
| POST | `/database/initialize` | Initialize database schema |
| POST | `/database/connect` | Connect with custom config |
| GET | `/export/csv` | Export articles to CSV |

---

## ML/AI Pipeline

### 1. Keyword Extraction
- **Model**: PubMedBERT (`microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract`)
- **Method**: KeyBERT with MMR (Maximal Marginal Relevance)
- **Output**: Top 7 keywords with scores >= 0.7

### 2. Query Expansion
- **MeSH Terms**: Medical Subject Headings vocabulary expansion
- **Process**: Each keyword expanded with related MeSH terms

### 3. Semantic Embeddings
- **Model**: PubMedBERT (768-dimensional vectors)
- **Storage**: PostgreSQL array columns
- **Use**: Novelty scoring via cosine similarity

### 4. Clustering Pipeline
- **Dimensionality Reduction**: UMAP
- **Clustering**: HDBSCAN (density-based)
- **Output**: Article cluster labels and centroids

### 5. Forecasting
- **Model**: ARIMA time-series
- **Input**: Citation history per year
- **Output**: Citation growth predictions

### 6. Opportunity Scoring
```
Overall Score = weighted_combination(
    Novelty Score,        # Semantic uniqueness (1 - avg_similarity)
    Citation Velocity,    # Citation growth rate
    Recency Score         # Publication timeliness
)
```

---

## Frontend Components

### Pages
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `+page.svelte` | Dashboard with search form |
| `/articles` | `articles/+page.svelte` | Article browser with table |
| `/articles/[pmid]` | `articles/[pmid]/+page.svelte` | Individual article view |
| `/analysis` | `analysis/+page.svelte` | Opportunity analysis |

### Shared Components
| Component | Purpose |
|-----------|---------|
| `Header.svelte` | Navigation header |
| `SearchForm.svelte` | Research idea input form |
| `KeywordPanel.svelte` | Generated keywords display |
| `ArticleTable.svelte` | Paginated article list |
| `SearchHistory.svelte` | Previous searches sidebar |
| `Notification.svelte` | Toast notifications |

---

## Data Flow

### Search Workflow
```
1. User enters research idea
         │
         ▼
2. Frontend calls POST /keywords/generate
         │
         ▼
3. Backend uses KeyBERT + PubMedBERT → returns keywords
         │
         ▼
4. User reviews keywords, sets date range
         │
         ▼
5. Frontend calls POST /search/pubmed
         │
         ▼
6. Backend expands with MeSH terms
         │
         ▼
7. Backend searches PubMed API
         │
         ▼
8. Backend fetches article summaries
         │
         ▼
9. Backend stores articles + computes embeddings
         │
         ▼
10. Background tasks: clustering, forecasting, scoring
         │
         ▼
11. Frontend shows success + confetti!
```

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | SvelteKit | Latest |
| Styling | Tailwind CSS | Latest |
| Language (FE) | TypeScript | 5.x |
| Backend | FastAPI | Latest |
| Language (BE) | Python | 3.9+ |
| Database | PostgreSQL | 13+ |
| ML Models | PubMedBERT, KeyBERT | - |
| Clustering | HDBSCAN, UMAP | - |
| Forecasting | ARIMA (statsmodels) | - |
| HTTP Client | Axios | Latest |

---

## External APIs

| API | Purpose | Rate Limits |
|-----|---------|-------------|
| NCBI E-utilities | PubMed article search/fetch | 3 req/sec (with key) |
| MeSH API | Medical vocabulary expansion | - |
| CrossRef | Citation data | Polite pool |
| OpenAlex | Academic metrics | - |

---

## Configuration

### Environment Variables (.env)
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=prime_time_db
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
```

### Frontend Proxy (vite.config.ts)
- `/api/*` proxies to `http://localhost:8000/*`
