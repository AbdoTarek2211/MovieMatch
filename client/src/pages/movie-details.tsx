import { useQuery } from "@tanstack/react-query";
import { Movie } from "@shared/schema";
import { useRoute } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieDetail } from "@/components/MovieDetail";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@radix-ui/react-navigation-menu";

export default function MovieDetailsPage() {
  const [match, params] = useRoute("/movie/:id");
  const movieId = params?.id

  const { data: movies, isLoading: isLoadingMovies } = useQuery<Movie[]>({
    queryKey: ["/api/movies/popular"],
  });

  const { data: favorites, isLoading: isLoadingFavorites } = useQuery<Movie[]>({
    queryKey: ["/api/favorites"],
  });

  const { data: directMovie, isLoading: isLoadingDirect, error: directMovieError } = useQuery<Movie | null>({
    queryKey: ["/api/movies", movieId],
    queryFn: async () => {
      if (!movieId) return null;
      const res = await fetch(`/api/movies/${movieId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch movie");
      }
      return res.json();
    },
    enabled: !!movieId
  });
  
  if (isLoadingMovies || isLoadingFavorites || isLoadingDirect || !movieId) {
    return (
      <div className="min-h-screen bg-neutral-900 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Find the movie from either popular movies or favorites
  const allMovies = [
    ...(movies || []), 
    ...(favorites || []),
    ...(directMovie ? [directMovie] : [])
  ];
  const movie = allMovies.find(m => m.movieId === movieId || m.id.toString() === movieId);

  if (!movie) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <h1 className="text-3xl font-bold">Movie Not Found</h1>
          <p className="mt-4">The movie you're looking for couldn't be found.</p>
          <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
            <Link href="/">Return to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (directMovieError) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="mt-4">There was an error loading the movie: {directMovieError.message}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <Navbar />
      <MovieDetail movie={movie} />
      <Footer />
    </div>
  );
}
