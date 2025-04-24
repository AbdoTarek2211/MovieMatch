import { useQuery } from "@tanstack/react-query";
import { Movie } from "@shared/schema";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieList } from "@/components/MovieList";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function RecommendationsPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: favorites } = useQuery<Movie[]>({
    queryKey: ["/api/favorites"],
  });

  const { data: recommendations, isLoading, error } = useQuery<Movie[]>({
    queryKey: ["recommendations", userId, favorites?.map(f => f.movieId)],
    enabled: !!userId && !!favorites,
    queryFn: async () => {
      try {
        const res = await apiRequest("POST", "/api/recommendations", {
          user_id: userId,
          favorite_movies: favorites?.map(f => f.movieId.toString()) || [],
        });
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error("Recommendation error:", err);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 text-white min-h-screen flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-20 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Recommended For You</h1>
        </div>
        {error && (
          <div className="p-4 bg-red-800 bg-opacity-20 rounded-lg border border-red-700 mb-8">
            <p className="text-red-300">Error loading recommendations. Please try again later.</p>
          </div>
        )}
        {recommendations && recommendations.length > 0 ? (
          <>
            <div className="mb-8 p-4 bg-neutral-800 rounded-lg border border-neutral-700">
              <div className="flex items-center mb-2">
                <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                <h2 className="text-lg font-medium">How it works</h2>
              </div>
              <p className="text-neutral-300 text-sm">
                These recommendations are based on the {favorites?.length || 0} movies in your list.
                Add more movies to your list to get better recommendations!
              </p>
            </div>

            <MovieList
              title="Recommendations"
              movies={recommendations}
              seeAllLink="/recommendations"
              showAddButton={false}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Sparkles className="h-16 w-16 text-yellow-600 mb-4" />
            <h2 className="text-xl font-medium text-neutral-300 mb-2">Add movies to get recommendations</h2>
            <p className="text-neutral-400 mb-6 text-center max-w-md">
              Start adding movies to your list so we can recommend movies that match your taste.
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/">Browse Movies</Link>
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}