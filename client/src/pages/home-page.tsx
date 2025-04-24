import { useQuery } from "@tanstack/react-query";
import { Movie } from "@shared/schema";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MovieList } from "@/components/MovieList";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: popularMovies, isLoading: isLoadingPopular } = useQuery<Movie[]>({
    queryKey: ["/api/movies/popular"],
  });

  const { data: favorites, isLoading: isLoadingFavorites } = useQuery<Movie[]>({
    queryKey: ["/api/favorites"],
  });

  if (isLoadingPopular || isLoadingFavorites) {
    return (
      <div className="min-h-screen bg-neutral-900 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Select a featured movie from popular movies
  const featuredMovie = popularMovies && popularMovies.length > 0 
    ? popularMovies[0] 
    : null;

  return (
    <div className="bg-neutral-900 text-white min-h-screen flex flex-col">
      <Navbar />
      
      {featuredMovie && (
        <Hero 
          title={featuredMovie.title}
          overview={featuredMovie.overview}
          backdropPath={featuredMovie.backdropPath}
          releaseDate={featuredMovie.releaseDate}
          runtime={featuredMovie.runtime}
          genres={featuredMovie.genres}
          id={featuredMovie.id}
        />
      )}
      
      <main className="container mx-auto px-4 pb-20 flex-grow">
        {/* Recommended Section */}
        <MovieList 
          title="Popular Movies" 
          movies={popularMovies || []} 
          seeAllLink="/movies"
        />
        
        {/* My List Section */}
        {favorites && favorites.length > 0 && (
          <MovieList 
            title="My List" 
            movies={favorites} 
            seeAllLink="/my-list" 
            showAddButton={false}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
