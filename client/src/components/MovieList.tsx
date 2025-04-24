import { Movie } from "@shared/schema";
import { MovieCard } from "./MovieCard";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

interface MovieListProps {
  title: string;
  movies: Movie[];
  seeAllLink?: string;
  showAddButton?: boolean;
}

export function MovieList({ title, movies, seeAllLink, showAddButton = true }: MovieListProps) {
  if (!movies.length) return null;

  return (
    <section className="py-8">
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          {seeAllLink && (
            <Link href={seeAllLink} className="text-neutral-400 hover:text-white text-sm transition flex items-center">
              See All <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} showAddButton={showAddButton} />
        ))}
        
        {title === "My List" && (
          <div className="rounded-md border-2 border-dashed border-neutral-700 flex items-center justify-center h-full min-h-[12rem] cursor-pointer hover:border-primary transition aspect-[2/3]">
            <div className="text-center p-4">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-neutral-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-neutral-400 text-sm">Add more movies</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
