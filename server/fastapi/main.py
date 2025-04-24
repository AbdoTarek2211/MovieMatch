from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import joblib, pickle
import pandas as pd
from surprise import SVDpp
from scipy.sparse import load_npz
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load saved models and data
svdpp = pickle.load(open(os.path.join(os.path.dirname(__file__), "svdpp_model.pkl"), "rb"))
tfidf = joblib.load(os.path.join(os.path.dirname(__file__), "tfidf_vectorizer.pkl"))
nn = joblib.load(os.path.join(os.path.dirname(__file__), "nn_model.pkl"))
tfidf_matrix = load_npz(os.path.join(os.path.dirname(__file__), "tfidf_matrix.npz"))
movies = joblib.load(os.path.join(os.path.dirname(__file__), "movies_df.pkl"))
indices = joblib.load(os.path.join(os.path.dirname(__file__), "title_indices.pkl"))

class RecommendationRequest(BaseModel):
    user_id: int
    favorite_movies: List[str]  # movieId as strings

@app.post("/recommendations")
def recommend_movies(req: RecommendationRequest):
    movie_ids = req.favorite_movies
    user_id = req.user_id

    # Match one valid movie from the user's list
    matched_movies = movies[movies["movieId"].astype(str).isin(movie_ids)]
    if matched_movies.empty:
        raise HTTPException(status_code=404, detail="No valid movies found in the request.")

    movie_title = matched_movies.iloc[0]["title"]

    if movie_title not in indices:
        raise HTTPException(status_code=404, detail=f"Movie title '{movie_title}' not found in database.")

    # Step 1: Content-based similarity
    idx = indices[movie_title]
    distances, knn_indices = nn.kneighbors(tfidf_matrix[idx], n_neighbors=25)
    similar_indices = knn_indices.flatten()[1:]  # skip the first (it's the same movie)
    similar_movies = movies.iloc[similar_indices].copy()

    # Step 2: Predict ratings using SVD++
    similar_movies['score'] = similar_movies['movieId'].apply(
        lambda x: svdpp.predict(str(user_id), x).est
    )

    # Step 3: Sort by predicted score
    top_movies = similar_movies.sort_values('score', ascending=False).head(10)
    top_movies = top_movies.rename(columns={'movieId': 'movieId'})

    return {"recommendations": top_movies[['movieId', 'title', 'genres', 'score']].to_dict(orient='records')}