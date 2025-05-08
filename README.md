# MovieMatch - Hybrid Movie Recommendation System

![MovieMatch Screenshot](https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80)

## Overview

MovieMatch is an intelligent movie recommendation platform that combines the power of content-based and collaborative filtering techniques to deliver personalized movie suggestions. The system leverages the MovieLens 25M dataset and provides recommendations through a modern web interface built with React, TypeScript, and Vite, powered by a FastAPI backend.

## Key Features

- **Hybrid Recommendation Engine**: Combines TF-IDF-based content filtering with SVD++ collaborative filtering
- **Personalized Suggestions**: Tailored recommendations based on user preferences and viewing history
- **Modern UI**: Clean, responsive interface with dark mode support
- **User Accounts**: Secure authentication system with session management
- **Watchlist Management**: Save and organize movies you want to watch
- **Detailed Movie Information**: Comprehensive movie details and metadata

## Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations

### Backend
- **FastAPI** (Python) for recommendation API
- **Express** (Node.js) for web server and authentication
- **Passport.js** for authentication
- **Drizzle ORM** for database interactions

### Machine Learning
- **Scikit-learn** for TF-IDF vectorization and nearest neighbors
- **Surprise** for SVD++ collaborative filtering
- **Pandas** for data manipulation

## Installation

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- PostgreSQL

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/moviematch.git
   cd moviematch
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Set up Python environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Data Preparation

The recommendation system uses the MovieLens 25M dataset. To set up the data:

1. Download the dataset from [MovieLens](https://grouplens.org/datasets/movielens/25m/)
2. Preprocess the data using the provided Python scripts
3. Train the models and save them in the appropriate directory

## Project Structure

```
moviematch/
├── client/               # Frontend React application
│   ├── src/              # Source files
│   ├── pages/            # Pages 
|   ├── hooks/            # Static assets
|   ├── components/       # Components
│   └── lib/              # Queries
├── server/               # Backend server
│   ├── fastapi/          # Python recommendation API
│   └── Server files      # Node.js web server
├── data/                 # Database schema and migrations
└── README.md             # This file
```

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.
