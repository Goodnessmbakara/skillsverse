import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Briefcase, User, LayoutDashboard } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
              Web3 Jobs AI
            </a>
          </Link>
          
          <div className="flex gap-4">
            <Link href="/jobs">
              <Button 
                variant={location === "/jobs" ? "default" : "ghost"}
                className="gap-2"
              >
                <Briefcase size={20} />
                Jobs
              </Button>
            </Link>
            
            <Link href="/profile">
              <Button 
                variant={location === "/profile" ? "default" : "ghost"}
                className="gap-2"
              >
                <User size={20} />
                Profile
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button 
                variant={location === "/dashboard" ? "default" : "ghost"}
                className="gap-2"
              >
                <LayoutDashboard size={20} />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
