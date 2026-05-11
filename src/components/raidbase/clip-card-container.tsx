"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

import { ClipCard } from "@/components/raidbase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type ClipCardContainerProps = {
  id: string;
  title: string;
  player: string;
  game: string;
  duration: string;
  views: string;
  mood: string;
  url?: string;
  provider?: string;
  thumbnailUrl?: string;
};

export function ClipCardContainer({
  id,
  title,
  player,
  game,
  duration,
  views,
  mood,
  url,
  provider,
  thumbnailUrl,
}: ClipCardContainerProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLikeToggle = async () => {
    setIsLoading(true);
    try {
      const endpoint = isLiked
        ? `/api/clips/${id}/unlike`
        : `/api/clips/${id}/like`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          variant: "error",
          title: "Action failed",
          description: result.error?.message || "Unable to process like.",
        });
        return;
      }

      setIsLiked(!isLiked);
      toast({
        variant: "success",
        title: isLiked ? "Removed like" : "Clip liked",
        description: isLiked ? "Like removed." : "Added to your favorites.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Network error",
        description: "Unable to process like. Try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <ClipCard
        title={title}
        player={player}
        game={game}
        duration={duration}
        views={views}
        mood={mood}
        url={url}
        provider={provider}
      />
      <Button
        variant={isLiked ? "primary" : "secondary"}
        size="sm"
        onClick={handleLikeToggle}
        disabled={isLoading}
        className="w-full"
      >
        <Heart
          className={`mr-2 h-4 w-4 ${isLiked ? "fill-current" : ""}`}
        />
        {isLiked ? "Liked" : "Like clip"}
      </Button>
    </div>
  );
}
