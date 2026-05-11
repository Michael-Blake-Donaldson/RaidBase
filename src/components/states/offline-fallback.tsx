import { WifiOff } from "lucide-react";

type OfflineFallbackProps = {
  className?: string;
};

export function OfflineFallback({ className = "" }: OfflineFallbackProps) {
  return (
    <div
      className={[
        "rb-surface-soft flex flex-col items-center justify-center rounded-[28px] px-6 py-16 text-center",
        className,
      ].join(" ")}
    >
      <WifiOff className="rb-text-muted mb-4 h-10 w-10" />
      <h3 className="rb-text-strong text-lg font-semibold">You appear to be offline</h3>
      <p className="rb-text-muted mt-2 max-w-sm text-sm leading-7">
        Check your connection and refresh the page to continue.
      </p>
    </div>
  );
}
