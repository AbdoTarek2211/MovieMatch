import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  overview: text("overview").notNull(),
  posterPath: text("poster_path").notNull(),
  backdropPath: text("backdrop_path").notNull(),
  releaseDate: text("release_date").notNull(),
  runtime: integer("runtime").notNull(),
  genres: text("genres").notNull(),
  voteAverage: text("vote_average").notNull(),
  movieId: text("movie_id").notNull().unique(),
});

export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  movieId: integer("movie_id").notNull().references(() => movies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  fullName: true,
});

export const insertMovieSchema = createInsertSchema(movies).pick({
  title: true,
  overview: true,
  posterPath: true,
  backdropPath: true,
  releaseDate: true,
  runtime: true,
  genres: true,
  voteAverage: true,
  movieId: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).pick({
  userId: true,
  movieId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;
export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = z.infer<typeof insertUserFavoriteSchema>;
