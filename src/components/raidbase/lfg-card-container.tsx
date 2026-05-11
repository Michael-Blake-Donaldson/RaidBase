"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { LfgCard } from "@/components/raidbase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type LfgCardContainerProps = {
  id: string;
  title: string;
  game: string;
  region: string;
  rank: string;
  roles: string[];
  schedule: string;
  tone: string;
  micRequired: boolean;
  openSpots: number;
};

type ApplicationStatus = "none" | "pending" | "approved" | "rejected";

export function LfgCardContainer({
  id,
  title,
  game,
  region,
  rank,
  roles,
  schedule,
  tone,
  micRequired,
  openSpots,
}: LfgCardContainerProps) {
  const [status, setStatus] = useState<ApplicationStatus>("none");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleApply = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lfg/posts/${id}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Interested in joining your stack.",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          variant: "error",
          title: "Application failed",
          description: result.error?.message || "Unable to submit application.",
        });
        return;
      }

      setStatus("pending");
      toast({
        variant: "success",
        title: "Request sent",
        description: "Your application is waiting for review.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Network error",
        description: "Unable to submit application. Try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    // Note: We'd need to store appId to implement withdraw
    // For MVP, we'll just show a message
    toast({
      variant: "info",
      title: "Withdraw",
      description: "Use the My Applications view to withdraw.",
    });
  };

  const getButtonLabel = () => {
    if (status === "pending") return "Application pending";
    if (status === "approved") return "Request approved";
    if (status === "rejected") return "Request declined";
    return "Apply to join";
  };

  const getButtonVariant = () => {
    if (status === "pending") return "secondary";
    if (status === "approved") return "secondary";
    if (status === "rejected") return "subtle";
    return "primary";
  };

  return (
    <div className="space-y-3">
      <LfgCard
        id={id}
        title={title}
        game={game}
        region={region}
        rank={rank}
        roles={roles}
        schedule={schedule}
        tone={tone}
        micRequired={micRequired}
        openSpots={openSpots}
      />
      <div className="flex gap-2">
        <Button
          variant={getButtonVariant()}
          size="sm"
          onClick={handleApply}
          disabled={isLoading || status !== "none"}
          className="flex-1"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonLabel()}
        </Button>
        {status === "pending" && (
          <Button variant="subtle" size="sm" onClick={handleWithdraw} disabled={isLoading}>
            Withdraw
          </Button>
        )}
      </div>
    </div>
  );
}
