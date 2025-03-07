import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center gap-8 py-16">
      <h1 className="text-4xl md:text-6xl font-bold max-w-3xl leading-tight bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
        Find Your Dream Web3 Job Using AI-Powered Matching
      </h1>
      
      <p className="text-xl text-muted-foreground max-w-2xl">
        Connect with top blockchain companies and get personalized job matches based on your skills and experience.
      </p>
      
      <div className="flex gap-4 mt-4">
        <Link href="/jobs">
          <Button size="lg" className="gap-2">
            Browse Jobs
            <ArrowRight size={20} />
          </Button>
        </Link>
        
        <Link href="/profile">
          <Button size="lg" variant="outline">
            Create Profile
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="p-6 bg-card rounded-lg">
          <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
          <p className="text-muted-foreground">
            Get matched with jobs that align with your skills and experience using our advanced AI algorithm.
          </p>
        </div>
        
        <div className="p-6 bg-card rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Web3 Focus</h3>
          <p className="text-muted-foreground">
            Specialized job listings from top blockchain and cryptocurrency companies.
          </p>
        </div>
        
        <div className="p-6 bg-card rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Smart Profiles</h3>
          <p className="text-muted-foreground">
            Create a blockchain-verified profile to showcase your skills and experience.
          </p>
        </div>
      </div>
    </div>
  );
}
