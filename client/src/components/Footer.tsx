import { Link } from "wouter";
import { Facebook, Linkedin, Github } from "lucide-react";
import { Kaggle } from "../components/ui/kaggle.tsx";
export function Footer() {
  return (
    <footer className="bg-neutral-900 py-8 border-t border-neutral-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center"> {/* Centering container */}
          <div className="mb-6"> {/* Social media section */}
            <h3 className="text-white font-semibold mb-4 text-center">Follow Me</h3>
            <div className="flex justify-center space-x-6">
              <Link 
                href="https://www.facebook.com/AbdoTarek2211" 
                className="text-neutral-400 hover:text-white transition"
                aria-label="Facebook">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link 
                href="https://www.linkedin.com/in/abdelrahman-tarek-m" 
                className="text-neutral-400 hover:text-white transition"
                aria-label="LinkedIn">
                <Linkedin className="h-6 w-6" />
              </Link>
              <Link 
                href="https://github.com/AbdoTarek2211" 
                className="text-neutral-400 hover:text-white transition"
                aria-label="GitHub">
                <Github className="h-6 w-6" />
              </Link>
              <Link 
                href="https://www.kaggle.com/abdelrahmantarekm" 
                className="text-neutral-400 hover:text-white transition"
                aria-label="Kaggle">
                <Kaggle className="h-6 w-6" />
              </Link>
            </div>
          </div>
          <div className="w-full text-center">
            <p className="text-neutral-500 text-sm">
              2025 MovieMatch. Made By Abdelrahman Tarek.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}