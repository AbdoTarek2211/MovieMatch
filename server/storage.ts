import {
  users,
  User,
  InsertUser,
  movies,
  Movie,
  InsertMovie,
  userFavorites,
  UserFavorite,
  InsertUserFavorite,
} from "@shared/schema";

import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { db } from "@lib/db";
import { eq, and, inArray } from "drizzle-orm";

// Create Postgres session store
const PgSessionStore = connectPgSimple(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getMovie(id: number): Promise<Movie | undefined>;
  getMovieByMovieId(movieId: string): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  getAllMovies(): Promise<Movie[]>;
  getMoviesByIds(ids: number[]): Promise<Movie[]>;

  getUserFavorites(userId: number): Promise<Movie[]>;
  addToFavorites(userFavorite: InsertUserFavorite): Promise<UserFavorite>;
  removeFromFavorites(userId: number, movieId: number): Promise<void>;
  isMovieInFavorites(userId: number, movieId: number): Promise<boolean>;

  sessionStore: session.Store;
}

// ✅ PostgreSQL-backed implementation
export class PostgresStorage implements IStorage {
  sessionStore = new PgSessionStore({
    conString: process.env.DATABASE_URL!,
    tableName: 'session',
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 15,...(process.env.NODE_ENV === 'production' ? {ssl: { rejectUnauthorized: false }} : {})
  });

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }  

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const result = await db.select().from(movies).where(eq(movies.id, id)).limit(1);
    return result[0];
  }

  async getMovieByMovieId(movieId: string): Promise<Movie | undefined> {
    const result = await db.select().from(movies).where(eq(movies.movieId, movieId)).limit(1);
    return result[0];
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const [result] = await db.insert(movies).values(movie).onConflictDoNothing().returning();
    return result;
  }

  async getAllMovies(): Promise<Movie[]> {
    return await db.select().from(movies);
  }

  async getMoviesByIds(ids: number[]): Promise<Movie[]> {
    return await db.select().from(movies).where(inArray(movies.id, ids));
  }

  async getUserFavorites(userId: number): Promise<Movie[]> {
    const favorites = await db.select().from(userFavorites).where(eq(userFavorites.userId, userId));
    const movieIds = favorites.map(f => f.movieId);
    return this.getMoviesByIds(movieIds);
  }

  async addToFavorites(fav: InsertUserFavorite): Promise<UserFavorite> {
    const [result] = await db.insert(userFavorites).values(fav).onConflictDoNothing().returning();
    return result;
  }

  async removeFromFavorites(userId: number, movieId: number): Promise<void> {
    await db
      .delete(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.movieId, movieId)));
  }

  async isMovieInFavorites(userId: number, movieId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.movieId, movieId)))
      .limit(1);
    return result.length > 0;
  }
}

// 👇 Export the actual instance
export const storage = new PostgresStorage();