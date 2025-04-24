import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { pool } from "../lib/db";
import { fileURLToPath } from "url";
import { dirname } from "path";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MOVIELENS_PATH = path.join(__dirname, "..", "data", "movies.csv");
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_URL = `https://api.themoviedb.org/3`;

// Configurable settings
const DELAY_BETWEEN_CALLS_MS = 250; // TMDB allows ~40 requests/10 seconds
const BATCH_SIZE = 100; // Number of movies to process in each enrichment batch
const START_FROM_INDEX = 0; // Change this to resume from a specific batch

async function fetchTMDBData(title: string, year?: string) {
  try {
    // First search for the movie
    const searchResponse = await axios.get(
      `${TMDB_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}${year ? `&year=${year}` : ""}`,
      { timeout: 5000 }
    );

    if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
      throw new Error("Movie not found on TMDB");
    }

    // Get details for the first result (most relevant)
    const movieId = searchResponse.data.results[0].id;
    const detailsResponse = await axios.get(
      `${TMDB_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`,
      { timeout: 5000 }
    );

    return detailsResponse.data;
  } catch (error: any) {
    console.error(`TMDB fetch failed for "${title}":`, error.message);
    return null;
  }
}

// --- Schema-compliant data preparation ---
function prepareMovieData(tmdbData: any) {
  return {
    overview: tmdbData.overview || "",
    poster_path: tmdbData.poster_path ? `https://image.tmdb.org/t/p/original${tmdbData.poster_path}` : "",
    backdrop_path: tmdbData.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}` : "",
    release_date: tmdbData.release_date || "",
    runtime: tmdbData.runtime || 0,
    vote_average: String(tmdbData.vote_average || "0"),
  };
}

// --- Main Import Function ---
async function importMovieLensMovies() {
  const movies: Array<{
    movieId: string;
    title: string;
    genres: string;
  }> = [];

  // 1. Load CSV
  await new Promise<void>((resolve) => {
    fs.createReadStream(MOVIELENS_PATH)
      .pipe(csv())
      .on("data", (row) => {
        movies.push({
          movieId: row.movieId || row.id,
          title: row.title,
          genres: row.genres,
        });
      })
      .on("end", resolve);
  });

  console.log(`🎬 Found ${movies.length} movies in CSV`);

  try {
    // 2. Insert base movie data
    const insertBatchSize = 1000;
    console.log("📥 Inserting base movie data in batches...");
    
    for (let i = 0; i < movies.length; i += insertBatchSize) {
      const batch = movies.slice(i, i + insertBatchSize);
      const values = batch.map((movie) => [
        movie.movieId,
        movie.title,
        movie.genres,
      ]);

      await pool.query("BEGIN");
      await pool.query(
        `INSERT INTO movies (movie_id, title, genres)
         SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[])
         ON CONFLICT (movie_id) DO NOTHING`,
        [
          values.map((v) => v[0]),
          values.map((v) => v[1]),
          values.map((v) => v[2]),
        ]
      );
      await pool.query("COMMIT");
      
      console.log(`✅ Inserted base data for batch ${Math.floor(i / insertBatchSize) + 1}/${Math.ceil(movies.length / insertBatchSize)}`);
    }

    // 3. Enrich with TMDB data in batches
    console.log("🍿 Enriching with TMDB data in batches...");
    let enrichedMovieCount = 0;
    let failedMovieCount = 0;

    // Calculate total batches for logging
    const totalBatches = Math.ceil(movies.length / BATCH_SIZE);
    
    // Process from the specified starting batch
    for (let batchIndex = Math.floor(START_FROM_INDEX / BATCH_SIZE); batchIndex < totalBatches; batchIndex++) {
      const startIdx = batchIndex * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, movies.length);
      const currentBatch = movies.slice(startIdx, endIdx);
      
      console.log(`\n🎬 Processing batch ${batchIndex + 1}/${totalBatches} (movies ${startIdx + 1}-${endIdx})`);
      
      await pool.query("BEGIN");
      
      // Process each movie in the batch
      for (let i = 0; i < currentBatch.length; i++) {
        const { movieId, title } = currentBatch[i];
        const overallIndex = startIdx + i;
        
        console.log(`🔍 [${overallIndex + 1}/${movies.length}] Processing ${title}`);

        try {
          const yearMatch = title.match(/\((\d{4})\)/);
          const year = yearMatch?.[1];
          const cleanTitle = title.replace(/\(\d{4}\)/, "").trim();

          const tmdbData = await fetchTMDBData(cleanTitle, year);
          if (!tmdbData) {
            failedMovieCount++;
            continue;
          }

          const preparedData = prepareMovieData(tmdbData);

          await pool.query(
            `UPDATE movies SET
              overview = $1,
              poster_path = $2,
              backdrop_path = $3,
              release_date = $4,
              runtime = $5,
              vote_average = $6
             WHERE movie_id = $7`,
            [
              preparedData.overview,
              preparedData.poster_path,
              preparedData.backdrop_path,
              preparedData.release_date,
              preparedData.runtime,
              preparedData.vote_average,
              movieId,
            ]
          );

          enrichedMovieCount++;
          console.log(`✨ Enriched ${title}`);

        } catch (err: any) {
          console.error(`❌ Failed to process ${title}:`, err.message);
          failedMovieCount++;
          continue;
        }

        // Respect API rate limits
        if (i < currentBatch.length - 1) {
          await new Promise((r) => setTimeout(r, DELAY_BETWEEN_CALLS_MS));
        }
      }
      
      await pool.query("COMMIT");
      
      // Save progress after each batch
      fs.writeFileSync(
        path.join(__dirname, "import_progress.json"),
        JSON.stringify({ 
          lastBatchIndex: batchIndex,
          lastIndex: endIdx - 1,
          processed: enrichedMovieCount,
          failed: failedMovieCount
        })
      );
      
      console.log(`✅ Batch ${batchIndex + 1}/${totalBatches} completed and committed to database`);
    }

    console.log(`
    🎉 Import Complete!
    ===================
    Total movies processed: ${movies.length}
    Successfully enriched: ${enrichedMovieCount}
    Failed to enrich: ${failedMovieCount}
    `);
  } catch (err: any) {
    await pool.query("ROLLBACK");
    console.error("❌ Transaction failed:", err.message);
    process.exit(1);
  }
}

// --- Run with timing ---
console.time("Total Import Time");
importMovieLensMovies()
  .then(() => console.timeEnd("Total Import Time"))
  .catch(console.error);