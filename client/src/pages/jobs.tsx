import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobCard from "@/components/job-card";
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import WalletManager from '@/components/auth/WalletManager';
import suiClient from "@/components/auth/suiClient";


interface Job {
  id: string;
  title: string;
  company: string; // employer address
  description: string; // Walrus URL
  blockchain: string;
  salary: string; 
  location: string; 
}

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [blockchain, setBlockchain] = useState<string>("all");
  const { toast } = useToast();
  const address = WalletManager.getAddress();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const objects = await suiClient.getAllObjects({
        options: { showContent: true },
        filter: { StructType: '0xYourPackageId::marketplace::Job' },
      });
      return objects.data.map((obj) => {
        const fields = obj.data?.content?.fields as any;
        return {
          id: obj.data?.objectId,
          title: Buffer.from(fields.title).toString(),
          company: fields.employer.slice(0, 6) + '...' + fields.employer.slice(-4), // Truncated address
          description: Buffer.from(fields.description_url).toString(), // Walrus URL
          blockchain: "sui", // Hardcoded for SkillsVerse
          salary: `${parseInt(fields.payment.fields.value) / 1_000_000_000} SUI`,
          location: "Remote", // Static for now
        };
      });
    },
    enabled: !!address,
  });

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchesBlockchain = blockchain === "all" || job.blockchain === blockchain;
    return matchesSearch && matchesBlockchain;
  });

  const handleApply = async (jobId: string) => { // Changed jobId to string
    if (!address) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please log in to apply for a job.",
      });
      return;
    }

    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: '0xYourPackageId::marketplace::apply_for_job',
        arguments: [tx.object(jobId)],
      });

      signAndExecute(
        {
          transactionBlock: tx,
          account: { address },
        },
        {
          onSuccess: () => {
            toast({
              title: "Application Submitted",
              description: "Your application has been sent successfully!",
            });
          },
          onError: (error) => {
            throw error;
          },
        }
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to submit application: ${error.message}`,
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
            <SelectItem value="all">All Chains</SelectItem>
            <SelectItem value="sui">Sui</SelectItem>
            <SelectItem value="ethereum">Ethereum</SelectItem>
            <SelectItem value="solana">Solana</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-card animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredJobs?.map(job => (
            <JobCard
              key={job.id}
              job={job}
              matchScore={Math.floor(Math.random() * 40) + 60} // Mock score; replace with real logic later
              onApply={handleApply}
            />
          ))}
          {(!filteredJobs || filteredJobs.length === 0) && (
            <p className="text-muted-foreground">No jobs match your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
}