import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Menu, Search, User, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { apiRequest} from "@/lib/queryClient";
import { Movie } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await apiRequest("GET", `/api/movies/search?q=${encodeURIComponent(query)}`, undefined);
      return await res.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setShowSearchResults(true);
    },
    onError: (error) => {
      toast({
        title: "Search failed",
        description: "Could not fetch search results",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value) {
      setShowSearchResults(false);
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.fullName) return "U";
    return user.fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="fixed top-0 w-full bg-gradient-to-b from-neutral-900/90 to-neutral-900/80 backdrop-blur-sm z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-primary font-bold text-2xl">MovieMatch</span>
          </Link>
          
          {/* Main Navigation - Desktop */}
          <nav className="hidden md:flex ml-8 space-x-6">
            <Link href="/" className={`font-medium ${location === '/' ? 'text-white' : 'text-neutral-400 hover:text-white'} transition`}>
              Home
            </Link>
            <Link href="/recommendations" className={`font-medium ${location === '/recommendations' ? 'text-white' : 'text-neutral-400 hover:text-white'} transition`}>
              Recommendations
            </Link>
            <Link href="/my-list" className={`font-medium ${location === '/my-list' ? 'text-white' : 'text-neutral-400 hover:text-white'} transition`}>
              My List
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search movies..."
              className="bg-neutral-800/70 border border-neutral-700 rounded-full py-1 px-4 pl-9 w-40 focus:w-60 transition-all duration-300 focus:outline-none text-sm"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
            <Search className="text-neutral-400 absolute left-3 top-2.5 h-4 w-4" />
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute right-0 mt-2 w-72 bg-neutral-800 rounded-md shadow-lg overflow-hidden z-10">
                <div className="py-2 max-h-96 overflow-y-auto">
                  {searchResults.map((movie) => (
                    <Link 
                      key={movie.id} 
                      href={`/movie/${movie.id}`}
                      className="block px-4 py-2 text-sm text-neutral-100 hover:bg-neutral-700"
                      onClick={() => {
                        setShowSearchResults(false);
                        setSearchQuery("");
                      }}
                    >
                      <div className="flex items-center">
                        {movie.posterPath && (
                          <img 
                            src={movie.posterPath} 
                            alt={movie.title} 
                            className="w-8 h-12 object-cover mr-3"
                          />
                        )}
                        <div>
                          <div>{movie.title}</div>
                          <div className="text-xs text-neutral-400">
                            {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ""}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </form>
          
          {/* Mobile Search Button */}
          <button 
            className="md:hidden text-neutral-300 hover:text-white transition"
            onClick={() => {
              // Implement mobile search
            }}
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-1">
                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white">
                  <span>{getInitials()}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-neutral-800 border-neutral-700">
              <DropdownMenuItem className="cursor-default focus:bg-neutral-700">
                <User className="mr-2 h-4 w-4" />
                <span>{user?.fullName || user?.username}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem 
                onClick={() => navigate("/my-list")}
                className="focus:bg-neutral-700"
              >
                My List
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate("/recommendations")}
                className="focus:bg-neutral-700"
              >
                Recommendations
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem 
                onClick={() => logoutMutation.mutate()}
                className="focus:bg-neutral-700 text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-neutral-300 hover:text-white transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden px-4 py-4 flex flex-col space-y-2 bg-neutral-800 border-t border-neutral-700">
          <form onSubmit={handleSearch} className="mb-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search movies..."
                className="bg-neutral-700 border-neutral-600 w-full"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                title="Search"
              >
                <Search className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
          </form>
          
          <Link 
            href="/" 
            className={`py-2 px-4 rounded-md ${location === '/' ? 'bg-primary text-white' : 'text-neutral-200'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            href="/recommendations" 
            className={`py-2 px-4 rounded-md ${location === '/recommendations' ? 'bg-primary text-white' : 'text-neutral-200'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Recommendations
          </Link>
          <Link 
            href="/my-list" 
            className={`py-2 px-4 rounded-md ${location === '/my-list' ? 'bg-primary text-white' : 'text-neutral-200'}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            My List
          </Link>
          <Button 
            variant="destructive" 
            className="mt-2" 
            onClick={() => {
              logoutMutation.mutate();
              setMobileMenuOpen(false);
            }}
          >
            Sign Out
          </Button>
        </nav>
      )}
    </header>
  );
}
