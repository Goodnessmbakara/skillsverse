import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Wallet, Brain, Building2, Trophy, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold max-w-4xl mx-auto leading-tight bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text mb-6">
            SkillsVerse: The Future of Web3 Talent
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect with top blockchain companies, verify your skills on-chain, and build your Web3 reputation through our AI-powered matching platform.
          </p>

          <div className="flex gap-4 justify-center mt-8">
            <Link href="/jobs">
              <Button size="lg" className="gap-2">
                Browse Jobs
                <ArrowRight size={20} />
              </Button>
            </Link>

            <Link href="/profile">
              <Button size="lg" variant="outline" className="gap-2">
                <Wallet size={20} />
                Connect Wallet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SkillsVerse?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-lg shadow-lg">
              <Brain className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
              <p className="text-muted-foreground">
                Our advanced AI algorithm matches your skills and experience with the perfect Web3 opportunities.
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg shadow-lg">
              <Wallet className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">On-Chain Verification</h3>
              <p className="text-muted-foreground">
                Verify your skills and experience directly on the blockchain using SUI protocol.
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg shadow-lg">
              <Building2 className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Web3 Focus</h3>
              <p className="text-muted-foreground">
                Connect with leading blockchain projects, DAOs, and Web3 companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">5,000+</h3>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">1,000+</h3>
              <p className="text-muted-foreground">Job Postings</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">500+</h3>
              <p className="text-muted-foreground">Successful Matches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">SkillsVerse</h4>
              <p className="text-sm text-muted-foreground">
                Revolutionizing Web3 talent acquisition through AI and blockchain technology.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/jobs">Browse Jobs</Link></li>
                <li><Link href="/profile">Create Profile</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/learn">Learning Hub</Link></li>
                <li><Link href="/docs">Documentation</Link></li>
                <li><Link href="/help">Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="https://twitter.com/skillsverse" target="_blank" rel="noopener">Twitter</a></li>
                <li><a href="https://discord.gg/skillsverse" target="_blank" rel="noopener">Discord</a></li>
                <li><a href="https://github.com/skillsverse" target="_blank" rel="noopener">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SkillsVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}