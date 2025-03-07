import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MatchScoreProps {
  score: number;
}

export default function MatchScore({ score }: MatchScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={cn("text-2xl font-bold", getScoreColor(score))}>
        {score}%
      </span>
      <Progress value={score} className="w-20" />
      <span className="text-xs text-muted-foreground">Match Score</span>
    </div>
  );
}
