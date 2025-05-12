import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Wallet, Brain, Building2, Trophy, Users, Blocks, Code, UserCheck, Sparkles, GraduationCap, Shield } from "lucide-react";
// import { motion } from "framer-motion";
import { motion } from 'motion/react';
import AuthServices from '@/components/auth/AuthServices'; // Add this import

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function Home() {
  // Check if user is authenticated
  const isAuthenticated = AuthServices.isAuthenticated();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with animated background */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/95 border-b border-border">
        <div className="absolute inset-0 w-full h-full bg-grid-white/[0.02] -z-10" />
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-background/80 to-background/95 backdrop-blur-sm -z-10" />

        <div className="container mx-auto px-4 py-24 md:py-32">
          <motion.div
            className="text-center max-w-5xl mx-auto"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              <span className="bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
                Where Web3 Talent Meets
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary/80 to-primary/40 text-transparent bg-clip-text">
                Opportunity
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Connect with top blockchain companies, verify your skills on-chain, and build your Web3 reputation through our AI-powered matching platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/jobs">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-lg h-12">
                  Explore Jobs
                  <ArrowRight size={20} />
                </Button>
              </Link>

              {/* Conditionally render the Connect Wallet button */}
              {!isAuthenticated && (
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-lg h-12">
                    <Wallet size={20} />
                    Connect Wallet
                  </Button>
                </Link>
              )}

              {/* Optionally show a dashboard button for authenticated users */}
              {isAuthenticated && (
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-lg h-12">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center">
                <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">5,000+</h3>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">1,000+</h3>
                <p className="text-sm text-muted-foreground">Job Postings</p>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</h3>
                <p className="text-sm text-muted-foreground">Companies</p>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">95%</h3>
                <p className="text-sm text-muted-foreground">Match Rate</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SkillsVerse?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with Web3 principles to create the most effective talent marketplace.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="relative p-8 rounded-xl bg-card shadow-lg border border-border overflow-hidden group hover:border-primary/50 transition-colors"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Brain className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
              <p className="text-muted-foreground">
                Our advanced AI algorithm analyzes your skills, experience, and blockchain activity to find your perfect match in the Web3 space.
              </p>
            </motion.div>

            <motion.div
              className="relative p-8 rounded-xl bg-card shadow-lg border border-border overflow-hidden group hover:border-primary/50 transition-colors"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Blocks className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">On-Chain Verification</h3>
              <p className="text-muted-foreground">
                Verify your skills and experience directly on the Sui blockchain, creating an immutable record of your achievements.
              </p>
            </motion.div>

            <motion.div
              className="relative p-8 rounded-xl bg-card shadow-lg border border-border overflow-hidden group hover:border-primary/50 transition-colors"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Code className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Contracts</h3>
              <p className="text-muted-foreground">
                Secure and transparent job agreements through blockchain-based smart contracts and escrow services.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started with SkillsVerse in four simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              className="flex flex-col items-center text-center p-6"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
              <p className="text-muted-foreground">Link your Web3 wallet to create your decentralized identity</p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center text-center p-6"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verify Skills</h3>
              <p className="text-muted-foreground">Get your skills verified through on-chain credentials</p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center text-center p-6"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Matched</h3>
              <p className="text-muted-foreground">Our AI matches you with the perfect opportunities</p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center text-center p-6"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Reputation</h3>
              <p className="text-muted-foreground">Earn reputation points and rewards for your contributions</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learning Resources Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Level Up Your Web3 Skills</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Access curated learning resources, complete challenges, and earn verifiable credentials to boost your profile.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Guided Learning Paths</h3>
                    <p className="text-muted-foreground">Follow structured paths to master Web3 technologies</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Skill Challenges</h3>
                    <p className="text-muted-foreground">Complete challenges to earn verifiable credentials</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Verified Badges</h3>
                    <p className="text-muted-foreground">Showcase your achievements with on-chain badges</p>
                  </div>
                </div>
              </div>
              <Button size="lg" className="mt-8">
                Explore Learning Hub
              </Button>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 border border-border">
              <div className="absolute inset-0 bg-grid-white/[0.02]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
                  <p className="text-muted-foreground">Interactive Learning Experience</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 to-background" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Web3 Journey?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals building the future of the decentralized web.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={'/login'}>
                <Button size="lg" className="w-full sm:w-auto">
                  Sign Up Now
                </Button>
              </Link>
              <Link to={'/learn-more'}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <h4 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text mb-4">
                SkillsVerse
              </h4>
              <p className="text-muted-foreground max-w-md mb-6">
                Revolutionizing Web3 talent acquisition through AI and blockchain technology.
              </p>
              <div className="flex gap-4">
                <a href="https://twitter.com/skillsverse" target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://discord.gg/skillsverse" target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
                <a href="https://github.com/skillsverse" target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link to="/jobs" className="text-muted-foreground hover:text-primary transition-colors">Browse Jobs</Link></li>
                <li><Link to="/employers" className="text-muted-foreground hover:text-primary transition-colors">For Employers</Link></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/enterprise" className="text-muted-foreground hover:text-primary transition-colors">Enterprise</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/learn" className="text-muted-foreground hover:text-primary transition-colors">Learning Hub</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/docs" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
                <li><Link to="/press" className="text-muted-foreground hover:text-primary transition-colors">Press</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} SkillsVerse. All rights reserved.
              </p>
              <div className="flex gap-4 md:justify-end text-sm text-muted-foreground">
                <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                <Link to="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}