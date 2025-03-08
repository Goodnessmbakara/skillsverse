import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import JobCard from "@/components/job-card";
import MatchScore from "@/components/match-score";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Briefcase, Building2, Users } from "lucide-react";
import WalletManager from '@/components/auth/WalletManager';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

// Import the deployment function
import { deploySkillsVerseContract } from "@/lib/deployContract";
import suiClient from "@/lib/suiClients";

interface Profile { id: string; owner: string; skills: Record<string, number>; reputation: number; type: string; }
interface Job { id: string; employer: string; title: string; description_url: string; payment: number; freelancer?: string; completed: boolean; }
interface Match { id: string; jobId: string; freelancer: string; score: number; status: 'pending' | 'accepted' | 'rejected'; }

const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  payment: z.number().min(0.1, "Payment must be at least 0.1 SUI"),
});

export default function Dashboard() {
  const address = WalletManager.getAddress();
  const { toast } = useToast();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const { data: user, isLoading: userLoading, error: userError } = useQuery<Profile>({
    queryKey: ['profile', address],
    queryFn: async () => {
      if (!address) throw new Error('Not authenticated');
      const objects = await suiClient.getOwnedObjects({ owner: address, options: { showContent: true }, filter: { StructType: '0xYourPackageId::marketplace::Profile' } });
      if (!objects.data.length) throw new Error('Profile not found');
      const profile = objects.data[0].data?.content?.fields as any;
      return {
        id: objects.data[0].data?.objectId,
        owner: profile.owner,
        skills: profile.skills.fields.contents.reduce((acc: Record<string, number>, item: any) => {
          acc[Buffer.from(item.fields.key).toString()] = item.fields.value;
          return acc;
        }, {}),
        reputation: parseInt(profile.reputation),
        type: Buffer.from(profile.type).toString(),
      };
    },
    enabled: !!address,
  });

  const { data: suiNSName } = useQuery<string | null>({
    queryKey: ['suiNS', address],
    queryFn: () => WalletManager.getSuiNSName(),
    enabled: !!address,
  });

  const { data: allJobs, isLoading: allJobsLoading } = useQuery<Job[]>({
    queryKey: ['allJobs'],
    queryFn: async () => {
      const objects = await suiClient.getAllObjects({ options: { showContent: true }, filter: { StructType: '0xYourPackageId::marketplace::Job' } });
      return objects.data.map((obj) => {
        const fields = obj.data?.content?.fields as any;
        return {
          id: obj.data?.objectId,
          employer: fields.employer,
          title: Buffer.from(fields.title).toString(),
          description_url: Buffer.from(fields.description_url).toString(),
          payment: parseInt(fields.payment.fields.value),
          freelancer: fields.freelancer?.fields?.value || undefined,
          completed: fields.completed,
        };
      });
    },
    enabled: !!address,
  });

  const { data: postedJobs, isLoading: jobsLoading, error: jobsError } = useQuery<Job[]>({
    queryKey: ['postedJobs', address],
    queryFn: async () => {
      const objects = await suiClient.getOwnedObjects({ owner: address, options: { showContent: true }, filter: { StructType: '0xYourPackageId::marketplace::Job' } });
      return objects.data.map((obj) => {
        const fields = obj.data?.content?.fields as any;
        return {
          id: obj.data?.objectId,
          employer: fields.employer,
          title: Buffer.from(fields.title).toString(),
          description_url: Buffer.from(fields.description_url).toString(),
          payment: parseInt(fields.payment.fields.value),
          freelancer: fields.freelancer?.fields?.value || undefined,
          completed: fields.completed,
        };
      });
    },
    enabled: !!address && user?.type === "employer",
  });

  const { data: candidateMatches, isLoading: candidateMatchesLoading } = useQuery<Match[]>({
    queryKey: ['candidateMatches', address],
    queryFn: async () => {
      if (!allJobs) return [];
      return allJobs.filter((job) => job.freelancer === address).map((job) => ({
        id: `${job.id}-match`,
        jobId: job.id,
        freelancer: address!,
        score: Math.floor(Math.random() * 40) + 60,
        status: job.completed ? 'accepted' : 'pending',
      }));
    },
    enabled: !!allJobs && user?.type === "candidate",
  });

  const { data: employerMatches, isLoading: employerMatchesLoading } = useQuery<Match[]>({
    queryKey: ['employerMatches', address],
    queryFn: async () => {
      if (!postedJobs) return [];
      return postedJobs.filter((job) => job.freelancer).map((job) => ({
        id: `${job.id}-match`,
        jobId: job.id,
        freelancer: job.freelancer!,
        score: Math.floor(Math.random() * 40) + 60,
        status: job.completed ? 'accepted' : 'pending',
      }));
    },
    enabled: !!postedJobs && user?.type === "employer",
  });

  const { data: kiosk, isLoading: kioskLoading } = useQuery<any>({
    queryKey: ['kiosk', address],
    queryFn: async () => {
      const objects = await suiClient.getOwnedObjects({ owner: address, options: { showContent: true }, filter: { StructType: '0x2::kiosk::Kiosk' } });
      if (!objects.data.length) return null;
      return { id: objects.data[0].data?.objectId };
    },
    enabled: !!address,
  });

  const form = useForm({ resolver: zodResolver(jobSchema), defaultValues: { title: "", description: "", payment: 1 } });

  const uploadToWalrus = async (data: string): Promise<Uint8Array> => {
    return new TextEncoder().encode(`https://walrus.storage/${encodeURIComponent(data)}`);
  };

  const onPostJob = async (data: any) => {
    try {
      if (!address) throw new Error('Not authenticated');
      const descriptionUrl = await uploadToWalrus(data.description);
      const paymentInMist = Math.floor(data.payment * 1_000_000_000);

      const tx = new TransactionBlock();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure(paymentInMist)]);
      tx.moveCall({
        target: '0xYourPackageId::marketplace::post_job',
        arguments: [tx.pure(new TextEncoder().encode(data.title)), tx.pure(descriptionUrl), coin],
      });

      signAndExecute({ transactionBlock: tx, account: { address } }, {
        onSuccess: () => {
          toast({ title: "Job Posted", description: "Your job has been posted successfully!" });
          form.reset();
        },
        onError: (error) => { throw error; },
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: `Failed to post job: ${error.message}` });
    }
  };

  const onCompleteJob = async (jobId: string, freelancer: string) => {
    try {
      if (!address || !kiosk) throw new Error('Not authenticated or no kiosk found');
      const tx = new TransactionBlock();
      tx.moveCall({
        target: '0xYourPackageId::marketplace::complete_job',
        arguments: [tx.object(jobId), tx.object(user!.id), tx.object(kiosk.id), tx.object('0xYourTransferPolicyId')],
      });

      signAndExecute({ transactionBlock: tx, account: { address } }, {
        onSuccess: () => {
          toast({ title: "Job Completed", description: "Payment transferred and NFT issued!" });
        },
        onError: (error) => { throw error; },
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: `Failed to complete job: ${error.message}` });
    }
  };

  const handleDeployContract = async () => {
    try {
      const packageId = await deploySkillsVerseContract(signAndExecute, address!);
      toast({ title: "Contract Deployed", description: `Package ID: ${packageId}` });
      // Update this in your app (e.g., via env or state management)
      console.log('Update 0xYourPackageId in your code with:', packageId);
    } catch (error) {
      toast({ variant: "destructive", title: "Deployment Failed", description: error.message });
    }
  };

  if (userLoading || jobsLoading || allJobsLoading || candidateMatchesLoading || employerMatchesLoading || kioskLoading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-card animate-pulse rounded-lg" />)}</div>;
  }

  if (userError || jobsError) {
    return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>Failed to load dashboard data: {(userError || jobsError)?.message}</AlertDescription></Alert>;
  }

  if (!address || !user) {
    return <Alert><AlertCircle className="h-4 w-4" /><AlertDescription>Please log in to view your dashboard.</AlertDescription></Alert>;
  }

  const isEmployer = user.type === "employer";
  const matches = isEmployer ? employerMatches : candidateMatches;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {suiNSName || address.slice(0, 6) + '...' + address.slice(-4)}
          </p>
        </div>
        <Button onClick={handleDeployContract}>Deploy Contract</Button> {/* Add deployment button */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Match Score</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches && matches.length > 0 ? Math.round(matches.reduce((acc, m) => acc + m.score, 0) / matches.length) : 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isEmployer ? "Posted Jobs" : "Active Applications"}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isEmployer ? postedJobs?.length || 0 : candidateMatches?.filter(m => m.status === 'pending').length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">{isEmployer ? "Applications Received" : "My Applications"}</TabsTrigger>
          {isEmployer && <TabsTrigger value="posted">Posted Jobs</TabsTrigger>}
          {isEmployer && <TabsTrigger value="post-job">Post a Job</TabsTrigger>}
        </TabsList>

        <TabsContent value="applications">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {matches?.map((match) => (
                <Card key={match.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <MatchScore score={match.score} />
                      <div>
                        <h3 className="font-semibold">{(isEmployer ? postedJobs : allJobs)?.find((j) => j.id === match.jobId)?.title || 'Unknown Job'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {isEmployer ? `Freelancer: ${match.freelancer.slice(0, 6)}...${match.freelancer.slice(-4)}` : `Applied on ${new Date().toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={match.status === "accepted" ? "default" : "secondary"}>
                        {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                      </Badge>
                      {isEmployer && match.status === "pending" && (
                        <Button onClick={() => onCompleteJob(match.jobId, match.freelancer)}>Complete Job</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!matches || matches.length === 0) && <p className="text-muted-foreground">No applications yet.</p>}
            </div>
          </ScrollArea>
        </TabsContent>

        {isEmployer && (
          <TabsContent value="posted">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {postedJobs?.map((job) => (
                  <JobCard key={job.id} job={{ id: job.id, title: job.title, company: job.employer.slice(0, 6) + '...' + job.employer.slice(-4), description: job.description_url, blockchain: "sui", salary: `${job.payment / 1_000_000_000} SUI`, location: "Remote" }} />
                ))}
                {(!postedJobs || postedJobs.length === 0) && <p className="text-muted-foreground">No jobs posted yet.</p>}
              </div>
            </ScrollArea>
          </TabsContent>
        )}

        {isEmployer && (
          <TabsContent value="post-job">
            <Card>
              <CardHeader>
                <CardTitle>Post a New Job</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onPostJob)} className="space-y-6">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="payment" render={({ field }) => (
                      <FormItem><FormLabel>Payment (SUI)</FormLabel><FormControl><Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full">Post Job</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}