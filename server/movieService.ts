import axios from 'axios';
import { storage } from './storage';
import { InsertMovie, Movie } from '@shared/schema';
import { db } from '@lib/db';
import { movies } from '@shared/schema';
import { sql, ilike, eq, or, desc } from 'drizzle-orm';

export interface MovieRecommendation {
  movieId: string;
  score: number;
  title: string;
  genres: string[];
}

const fastApiUrl = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';
export class MovieService {
  async getRecommendations(userId: number, userFavoriteMovieIds: string[]): Promise<Movie[]> {
    try {
      console.log(`Sending recommendation request to ${fastApiUrl}/recommendations`);
      console.log('Payload:', { user_id: userId, favorite_movies: userFavoriteMovieIds });
      
      const response = await axios.post(`${fastApiUrl}/recommendations`, {
        user_id: userId,
        favorite_movies: userFavoriteMovieIds
      });
  
      console.log('API response:', response.data);
      const recommendations = response.data.recommendations as MovieRecommendation[];

      // 2. Get full movie details for each recommendation
      const movieDetails = await Promise.all(
        recommendations.map(rec => this.getMovieById(rec.movieId))
      );

      // 3. Merge recommendation score with movie details
      return movieDetails
        .filter((movie): movie is Movie => movie !== null)
        .map(movie => ({
          ...movie,
          // Use movieId consistently
          recommendationScore: recommendations.find(r => r.movieId === movie.movieId)?.score
        }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error getting recommendations:', {
          message: error.message,
          code: error.code,
          url: error.config?.url,
          method: error.config?.method,
          response: error.response?.data
        });
      } else {
        console.error('Unknown error getting recommendations:', error);
      }
      throw error; // Re-throw to allow callers to handle the error
    }
  }

  // Save movie to storage
  async saveMovie(movieData: InsertMovie): Promise<Movie> {
    try {
      return await storage.createMovie(movieData);
    } catch (error) {
      console.error('Error saving movie to storage:', error);
      throw error;
    }
  }

  // Get movie by ID from storage
  async getMovieById(movieId: string): Promise<Movie | null> {
    try {
      const result = await db.select()
        .from(movies)
        .where(or(
          eq(movies.movieId, movieId),  // movie_id is text
          ...(!isNaN(Number(movieId)) ? [eq(movies.id, Number(movieId))] : [])
        ))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching movie:', error);
      return null;
    }
  }

  async searchMovies(query: string): Promise<Movie[]> {
    try {
      const results = await db
        .select()
        .from(movies)
        .where(ilike(movies.title, `%${query}%`))
        .limit(20);
      return results;
    } catch (error: any) {
      console.error('Error searching movies:', error);
      return [];
    }
  }

  // Get all movies from storage
  async getAllMovies(): Promise<Movie[]> {
    try {
      return await storage.getAllMovies();
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
  }
}

export const movieService = new MovieService();