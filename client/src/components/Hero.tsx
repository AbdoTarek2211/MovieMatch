import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Play, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface HeroProps {
  title: string;
  overview: string;
  backdropPath: string;
  releaseDate: string;
  runtime: number;
  genres: string;
  id: number;
}

export function Hero({ title, overview, backdropPath, releaseDate, runtime, genres, id }: HeroProps) {
  const { toast } = useToast();
  
  const { data: favorites, isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/favorites"],
  });
  
  const isInFavorites = favorites?.some(fav => fav.id === id);

  const addToFavorites = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/favorites", { movieId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to your list",
        description: `${title} has been added to your list`,
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
      await apiRequest("DELETE", `/api/favorites/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from your list",
        description: `${title} has been removed from your list`,
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

  const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : "";

  return (
    <section className="pt-16 md:pt-0 relative">
      <div className="relative h-[50vh] md:h-[80vh]">
        {/* Hero Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('${backdropPath}')` }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/90 to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 relative h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">{title}</h1>
            <div className="flex items-center space-x-4 mb-4">
              {releaseYear && (
                <span className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-xs">{releaseYear}</span>
              )}
              {runtime > 0 && (
                <span className="text-neutral-300 text-sm">{formatRuntime(runtime)}</span>
              )}
              {genres && (
                <span className="text-neutral-300 text-sm">{genres}</span>
              )}
            </div>
            <p className="text-neutral-300 text-sm md:text-base mb-6 line-clamp-3">
              {overview}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Trailer
              </Button>
              
              {isInFavorites ? (
                <Button 
                  className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white"
                  onClick={() => removeFromFavorites.mutate()}
                  disabled={removeFromFavorites.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  In My List
                </Button>
              ) : (
                <Button 
                  className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white"
                  onClick={() => addToFavorites.mutate()}
                  disabled={addToFavorites.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to My List
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
