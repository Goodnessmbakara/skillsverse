import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Job } from "@shared/schema";
import MatchScore from "./match-score";

interface JobCardProps {
  job: Job;
  matchScore?: number;
  onApply?: (jobId: number) => void;
}

export default function JobCard({ job, matchScore, onApply }: JobCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4">
        {job.companyLogo && (
          <img 
            src={job.companyLogo} 
            alt={job.company} 
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <p className="text-muted-foreground">{job.company}</p>
        </div>
        {matchScore !== undefined && (
          <div className="ml-auto">
            <MatchScore score={matchScore} />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="mb-4">{job.description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{job.blockchain}</Badge>
          <Badge variant="secondary">{job.role}</Badge>
          {job.location && <Badge variant="outline">{job.location}</Badge>}
          {job.salary && <Badge variant="outline">{job.salary}</Badge>}
        </div>
      </CardContent>
      
      {onApply && (
        <CardFooter>
          <Button 
            className="w-full"
            onClick={() => onApply(job.id)}
          >
            Apply Now
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
