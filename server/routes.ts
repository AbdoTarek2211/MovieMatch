import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { movieService } from "./movieService";
import { insertUserFavoriteSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { db } from "@lib/db"; // if not already imported
import { movies, userFavorites } from "@shared/schema";
import {eq, desc, count, sql, or } from "drizzle-orm"; // if needed
import axios from "axios";

// Authentication middleware
const ensureAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Movie routes
  app.get("/api/movies/popular", async (req, res) => {
    try {
      // Option 1: Using a subquery for better compatibility
      const results = await db
        .select({
          movie: movies,
          favCount: count(userFavorites.movieId).as("fav_count"), // Use snake_case for PostgreSQL
        })
        .from(movies)
        .leftJoin(userFavorites, eq(movies.id, userFavorites.movieId))
        .groupBy(movies.id)
        .orderBy(desc(count(userFavorites.movieId))) // Order by the count directly
        .limit(10);

      const popularMovies = results.map((r) => r.movie);
      res.json(popularMovies);
    } catch (error) {
      console.error("Error fetching popular movies:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      res.status(500).json({ error: "Failed to fetch popular movies" });
    }
  });

  app.get("/api/movies/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const searchResults = await movieService.searchMovies(query);
      res.json(searchResults);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ error: "Failed to search movies" });
    }
  });

  // User favorites routes
  app.get("/api/favorites", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { movieId } = insertUserFavoriteSchema.parse({
        ...req.body,
        userId,
      });
      const isInFavorites = await storage.isMovieInFavorites(userId, movieId);
      if (isInFavorites) {
        return res.status(400).json({ error: "Movie already in favorites" });
      }

      const favorite = await storage.addToFavorites({ userId, movieId });
      res.status(201).json(favorite);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error adding to favorites:", error);
      res.status(500).json({ error: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:movieId", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const movieIdParam = req.params.movieId;
      let movieId: number;
      if (!isNaN(Number(movieIdParam))) {
        movieId = Number(movieIdParam);
      } else {
        const movie = await movieService.getMovieById(movieIdParam);
        if (!movie) {
          return res.status(404).json({ error: "Movie not found" });
        }
        movieId = movie.id;
      }
      await storage.removeFromFavorites(userId, movieId);
      res.status(200).json({ message: "Movie removed from favorites" });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ error: "Failed to remove from favorites" });
    }
  });

  app.get('/api/movies/:movieId', async (req, res) => {
    try {
      const movieId = req.params.movieId;
      
      // Using Drizzle ORM's query builder
      const result = await db.select()
        .from(movies)
        .where(or(
          eq(movies.movieId, movieId),
          ...(!isNaN(Number(movieId)) ? [eq(movies.id, Number(movieId))] : [])
        ))
        .limit(1);
      
      if (result.length === 0) {
        return res.status(404).json({ error: "Movie not found" });
      }
      
      // Ensure consistent naming by adding movie_id property if needed by frontend
      const movie = {
        ...result[0],
        movie_id: result[0].movieId // Add this for frontend compatibility
      };
      
      res.json(movie);
    } catch (error) {
      console.error('Movie fetch error:', error);
      res.status(500).json({ error: "Failed to fetch movie" });
    }
  });
  
  // Recommendations route
  app.post("/api/recommendations", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const favorites = await storage.getUserFavorites(userId);

      if (favorites.length === 0) {
        const popularMovies = await movieService.getRecommendations(userId,favorites.map((movie) => movie.movieId.toString()));
        return res.json(popularMovies);
      }

      const recommendations = await movieService.getRecommendations(
        userId,
        favorites.map((movie) => movie.movieId.toString())
      );
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Check FastAPI service health
  app.get("/api/health/fastapi", async (req, res) => {
    try {
      const response = await axios.get(process.env.FASTAPI_URL || "http://localhost:8000",);
      res.status(200).json({ status: "ok", message: "API is running" });
    } catch (error) {
      res
        .status(500)
        .json({ status: "error", message: "FastAPI service is unavailable" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
