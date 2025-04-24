import { Movie } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Play, Plus, Check, Share2, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MovieDetailProps {
  movie: Movie;
}

export function MovieDetail({ movie }: MovieDetailProps) {
  const { toast } = useToast();
  
  const { data: favorites } = useQuery<Movie[]>({
    queryKey: ["/api/favorites"],
  });
  
  const isInFavorites = favorites?.some(fav => fav.id === movie.id);

  const addToFavorites = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/favorites", { movieId: movie.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to your list",
        description: `${movie.title} has been added to your list`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add movie to your list",
        variant: "destructive",
      });
    },
  });

  const removeFromFavorites = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/favorites/${movie.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from your list",
        description: `${movie.title} has been removed from your list`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove movie from your list",
        variant: "destructive",
      });
    },
  });

  // Format runtime to hours and minutes
  const formatRuntime = (minutes: number) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "";

  return (
    <div className="pt-16">
      {/* Movie Header */}
      <div className="relative h-64 md:h-96">
        {/* Backdrop Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('${movie.backdropPath}')` }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 p-6 w-full">
          <div className="container mx-auto flex items-start">
            {/* Poster Image */}
            <div className="hidden md:block flex-shrink-0 w-32 h-48 rounded-md overflow-hidden mr-6">
              {movie.posterPath && (
                <img 
                  src={movie.posterPath}
                  alt={`${movie.title} movie poster`} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Movie Info */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{movie.title}</h2>
              <div className="flex items-center space-x-3 mt-2">
                {releaseYear && (
                  <span className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-xs">{releaseYear}</span>
                )}
                {movie.runtime > 0 && (
                  <span className="text-neutral-300 text-sm">{formatRuntime(movie.runtime)}</span>
                )}
                {movie.genres && (
                  <span className="text-neutral-300 text-sm">{movie.genres}</span>
                )}
                {movie.voteAverage && (
                  <div className="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{movie.voteAverage}/10</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Movie Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Actions */}
        <div className="flex flex-wrap space-x-3 mb-6">
          <Button className="bg-primary hover:bg-primary/90 text-white">
            <Play className="h-4 w-4 mr-2" />
            Watch Trailer
          </Button>
          
          {isInFavorites ? (
            <Button 
              className="bg-neutral-800 hover:bg-neutral-700 text-white"
              onClick={() => removeFromFavorites.mutate()}
              disabled={removeFromFavorites.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              In My List
            </Button>
          ) : (
            <Button 
              className="bg-neutral-800 hover:bg-neutral-700 text-white"
              onClick={() => addToFavorites.mutate()}
              disabled={addToFavorites.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to My List
            </Button>
          )}
          
          <Button variant="ghost" className="bg-neutral-800 hover:bg-neutral-700 px-3">
            <ThumbsUp className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" className="bg-neutral-800 hover:bg-neutral-700 px-3">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Synopsis */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3">Synopsis</h3>
          <p className="text-neutral-300">
            {movie.overview}
          </p>
        </div>
        
        {/* Similar Movies section would go here */}
        {/* For now, we'll keep it simple */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">You might also like</h3>
          <p className="text-neutral-400 text-sm">
            Recommendations coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
