import { useQuery } from "@tanstack/react-query";
import { Movie } from "@shared/schema";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MovieList } from "@/components/MovieList";
import { Loader2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function MyListPage() {
  const { data: favorites, isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/favorites"],
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
          <h1 className="text-3xl font-bold">My List</h1>
        </div>
        
        {favorites && favorites.length > 0 ? (
          <MovieList 
            title="" 
            movies={favorites} 
            showAddButton={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Film className="h-16 w-16 text-neutral-700 mb-4" />
            <h2 className="text-xl font-medium text-neutral-300 mb-2">Your list is empty</h2>
            <p className="text-neutral-400 mb-6 text-center max-w-md">
              Start exploring movies and add them to your list to keep track of what you want to watch.
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
