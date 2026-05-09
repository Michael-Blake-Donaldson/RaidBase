import { headers as nextHeaders } from "next/headers";

import { getObservabilityEnv } from "@/lib/env";

type ObservabilityLevel = "info" | "warn" | "error";

type ObservabilityEvent = {
  event: string;
  level?: ObservabilityLevel;
  requestId?: string;
  payload?: Record<string, unknown>;
};

function writeLocalLog(level: ObservabilityLevel, message: Record<string, unknown>) {
  const formatted = JSON.stringify(message);

  if (level === "error") {
    console.error(formatted);
    return;
  }

  if (level === "warn") {
    console.warn(formatted);
    return;
  }

  console.info(formatted);
}

export async function getRequestId() {
  const store = await nextHeaders();
  return store.get("x-request-id") ?? crypto.randomUUID();
}

export async function emitObservabilityEvent(input: ObservabilityEvent) {
  const requestId = input.requestId ?? (await getRequestId());
  const { webhookUrl, serviceName, environment } = getObservabilityEnv();

  const message = {
    timestamp: new Date().toISOString(),
    service: serviceName,
    environment,
    requestId,
    event: input.event,
    level: input.level ?? "info",
    payload: input.payload ?? {},
  };

  writeLocalLog(message.level, message);

  if (!webhookUrl) {
    return { delivered: false, requestId } as const;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(message),
      cache: "no-store",
    });

    return {
      delivered: response.ok,
      requestId,
    } as const;
  } catch {
    writeLocalLog("warn", {
      event: "observability_forward_failed",
      service: serviceName,
      environment,
      requestId,
      payload: {
        target: webhookUrl,
      },
    });

    return { delivered: false, requestId } as const;
  }
}