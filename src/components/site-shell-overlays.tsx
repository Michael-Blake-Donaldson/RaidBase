"use client";

import { useEffect, useState } from "react";

import { NotificationsTray } from "@/components/notifications-tray";
import { WelcomeGuidePopup } from "@/components/welcome-guide-popup";

type SiteShellOverlaysProps = {
  shouldShowWelcomeGuide: boolean;
  notificationItems: Parameters<typeof NotificationsTray>[0]["items"];
};

export function SiteShellOverlays({ shouldShowWelcomeGuide, notificationItems }: SiteShellOverlaysProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <WelcomeGuidePopup shouldShow={shouldShowWelcomeGuide} />
      {mounted ? <NotificationsTray items={notificationItems} /> : null}
    </>
  );
}
