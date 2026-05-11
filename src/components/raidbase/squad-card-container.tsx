"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { SquadCard } from "@/components/raidbase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type SquadCardContainerProps = {
  id: string;
  name: string;
  game: string;
  members: number;
  openRoles: string[];
  synergy: number;
  status: string;
  activity: string;
  privacy: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
};

type RequestStatus = "none" | "pending" | "accepted" | "declined";

export function SquadCardContainer({
  id,
  name,
  game,
  members,
  openRoles,
  synergy,
  status,
  activity,
  privacy,
}: SquadCardContainerProps) {
  const [requestStatus, setRequestStatus] = useState<RequestStatus>("none");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleJoinRequest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/squads/${id}/join-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Interested in joining your squad.",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setRequestStatus("pending");
        }
        toast({
          variant: "error",
          title: "Join request failed",
          description: result.error?.message || "Unable to submit request.",
        });
        return;
      }

      setRequestStatus("pending");
      toast({
        variant: "success",
        title: "Request sent",
        description: "Your join request is waiting for approval.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Network error",
        description: "Unable to submit request. Try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    toast({
      variant: "info",
      title: "Withdraw",
      description: "Use the My Squads view to manage your requests.",
    });
  };

  const getButtonLabel = () => {
    if (requestStatus === "pending") return "Request pending";
    if (requestStatus === "accepted") return "Joined squad";
    if (requestStatus === "declined") return "Request declined";
    return "Request to join";
  };

  const getButtonVariant = () => {
    if (requestStatus === "pending") return "secondary";
    if (requestStatus === "accepted") return "secondary";
    if (requestStatus === "declined") return "subtle";
    return "primary";
  };

  const isPrivateSquad = privacy === "PRIVATE" || privacy === "INVITE_ONLY";

  return (
    <div className="space-y-3">
      <SquadCard
        id={id}
        name={name}
        game={game}
        members={members}
        openRoles={openRoles}
        synergy={synergy}
        status={status}
        activity={activity}
        privacy={privacy}
      />
      {!isPrivateSquad && (
        <div className="flex gap-2">
          <Button
            variant={getButtonVariant()}
            size="sm"
            onClick={handleJoinRequest}
            disabled={isLoading || requestStatus !== "none"}
            className="flex-1"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getButtonLabel()}
          </Button>
          {requestStatus === "pending" && (
            <Button variant="subtle" size="sm" onClick={handleWithdraw} disabled={isLoading}>
              Withdraw
            </Button>
          )}
        </div>
      )}
      {isPrivateSquad && (
        <p className="rb-text-muted text-xs text-center">
          This squad is {privacy === "INVITE_ONLY" ? "invite-only" : "private"}. Request an invite from the owner.
        </p>
      )}
    </div>
  );
}
