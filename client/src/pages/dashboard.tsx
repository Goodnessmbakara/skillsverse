import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import JobCard from "@/components/job-card";
import MatchScore from "@/components/match-score";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Briefcase, Building2, Users } from "lucide-react";
import { type User, type Job, type Match } from "@shared/schema";

export default function Dashboard() {
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ["/api/users/1"], // TODO: Get from auth context
  });

  const { data: matches, isLoading: matchesLoading, error: matchesError } = useQuery<Match[]>({
    queryKey: [`/api/matches/user/${user?.id}`],
    enabled: !!user?.id,
  });

  const { data: postedJobs, isLoading: jobsLoading, error: jobsError } = useQuery<Job[]>({
    queryKey: [`/api/jobs`],
    enabled: user?.type === "employer",
  });

  if (userLoading || matchesLoading || jobsLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-card animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (userError || matchesError || jobsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in to view your dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
        {user.avatar && (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matches?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Match Score
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matches && matches.length > 0
                ? Math.round(
                    matches.reduce((acc, m) => acc + m.score, 0) / matches.length
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {user.type === "employer" ? "Posted Jobs" : "Active Applications"}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.type === "employer"
                ? postedJobs?.length || 0
                : matches?.filter((m) => m.status === "pending").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">
            {user.type === "employer" ? "Applications Received" : "My Applications"}
          </TabsTrigger>
          {user.type === "employer" && (
            <TabsTrigger value="posted">Posted Jobs</TabsTrigger>
          )}
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
                        <h3 className="font-semibold">Job Title Here</h3>
                        <p className="text-sm text-muted-foreground">
                          Applied on{" "}
                          {new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={match.status === "accepted" ? "default" : 
                              match.status === "rejected" ? "destructive" : 
                              "secondary"}
                    >
                      {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {user.type === "employer" && (
          <TabsContent value="posted">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {postedJobs?.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}