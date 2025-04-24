import { Movie } from "@shared/schema";
import { useState } from "react";
import { Plus, Check, ThumbsUp } from "lucide-react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MovieCardProps {
  movie: Movie;
  showAddButton?: boolean;
}

export function MovieCard({ movie, showAddButton = true }: MovieCardProps) {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  
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

  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "";

  return (
    <div 
      className="rounded-md overflow-hidden relative group transition-transform hover:scale-105 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/movie/${movie.id}`}>
        <div className="aspect-[2/3] bg-neutral-800">
          {movie.posterPath ? (
            <img 
              src={movie.posterPath} 
              alt={`${movie.title} poster`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-500">
              No image
            </div>
          )}
        </div>
      </Link>
      
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="font-semibold text-sm md:text-base">{movie.title}</h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-neutral-300">{releaseYear}</span>
          <div className="flex space-x-2">
            {showAddButton && (
              isInFavorites ? (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromFavorites.mutate();
                  }}
                  className="w-7 h-7 rounded-full bg-neutral-800/80 flex items-center justify-center hover:bg-red-600 transition"
                  aria-label="Remove from favorites"
                >
                  <Check className="h-4 w-4" />
                </button>
              ) : (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToFavorites.mutate();
                  }}
                  className="w-7 h-7 rounded-full bg-neutral-800/80 flex items-center justify-center hover:bg-primary transition"
                  aria-label="Add to favorites"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )
            )}
            <button 
              className="w-7 h-7 rounded-full bg-neutral-800/80 flex items-center justify-center hover:bg-secondary transition"
              aria-label="Like movie"
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
