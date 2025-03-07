import { useQuery } from "@tanstack/react-query";
import { type Job } from "@shared/schema";
import JobCard from "@/components/job-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [blockchain, setBlockchain] = useState<string>("");
  const { toast } = useToast();
  
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                         job.company.toLowerCase().includes(search.toLowerCase());
    const matchesBlockchain = !blockchain || job.blockchain === blockchain;
    return matchesSearch && matchesBlockchain;
  });

  const handleApply = async (jobId: number) => {
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          userId: 1, // TODO: Get from auth context
          status: "pending"
        })
      });
      
      if (!res.ok) throw new Error("Failed to apply");
      
      toast({
        title: "Application Submitted",
        description: "Your application has been sent successfully!"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit application. Please try again."
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Web3 Jobs</h1>
      
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={blockchain} onValueChange={setBlockchain}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Blockchain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="sui">Sui</SelectItem>
            <SelectItem value="ethereum">Ethereum</SelectItem>
            <SelectItem value="solana">Solana</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-card animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs?.map(job => (
            <JobCard
              key={job.id}
              job={job}
              matchScore={Math.floor(Math.random() * 100)} // Mock score
              onApply={handleApply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
