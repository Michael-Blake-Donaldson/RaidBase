import { z } from "zod";

const optionalSecret = z.preprocess(
  (value) => (value === "" || value === "undefined" ? undefined : value),
  z.string().min(16).optional(),
);

const optionalConfig = z.preprocess(
  (value) => (value === "" || value === "undefined" ? undefined : value),
  z.string().min(1).optional(),
);

const strictValidationDefault = process.env.NODE_ENV === "production" ? "true" : "false";
const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  STRICT_ENV_VALIDATION: z
    .enum(["true", "false"])
    .default(strictValidationDefault)
    .transform((value) => value === "true"),
  NEXTAUTH_SECRET: optionalSecret,
  NEXTAUTH_URL: z.string().url().optional(),
  STRIPE_SECRET_KEY: optionalConfig,
  STRIPE_WEBHOOK_SECRET: optionalConfig,
  STRIPE_PRO_PRICE_ID: optionalConfig,
  UPSTASH_REDIS_REST_URL: optionalConfig,
  UPSTASH_REDIS_REST_TOKEN: optionalConfig,
  OBSERVABILITY_WEBHOOK_URL: z.string().url().optional(),
  OBSERVABILITY_SERVICE_NAME: optionalConfig,
});

const env = envSchema.parse(process.env);

function requiredInProduction(name: string, value: string | undefined) {
  if (env.NODE_ENV === "production" && env.STRICT_ENV_VALIDATION && !isProductionBuild && !value) {
    throw new Error(`${name} is required in production.`);
  }

  return value;
}

export function getAuthSecret() {
  if (env.NODE_ENV === "production" && !isProductionBuild && !env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is required in production.");
  }

  if (env.NEXTAUTH_SECRET) {
    return env.NEXTAUTH_SECRET;
  }

  if (isProductionBuild) {
    return "raidbase-build-only-secret";
  }

  return "raidbase-dev-only-secret";
}

export function getAppBaseUrl() {
  requiredInProduction("NEXTAUTH_URL", env.NEXTAUTH_URL);
  return env.NEXTAUTH_URL ?? "http://localhost:3000";
}

export function getStripeEnv() {
  const secretKey = env.STRIPE_SECRET_KEY;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  const proPriceId = env.STRIPE_PRO_PRICE_ID;

  if (env.NODE_ENV === "production") {
    requiredInProduction("STRIPE_SECRET_KEY", secretKey);
    requiredInProduction("STRIPE_WEBHOOK_SECRET", webhookSecret);
    requiredInProduction("STRIPE_PRO_PRICE_ID", proPriceId);
  }

  return {
    secretKey: secretKey ?? null,
    webhookSecret: webhookSecret ?? null,
    proPriceId: proPriceId ?? null,
  };
}

export function getRateLimitEnv() {
  const restUrl = env.UPSTASH_REDIS_REST_URL;
  const restToken = env.UPSTASH_REDIS_REST_TOKEN;

  if (env.NODE_ENV === "production" && env.STRICT_ENV_VALIDATION && Boolean(restUrl) !== Boolean(restToken)) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be configured together.");
  }

  if (env.NODE_ENV === "production" && env.STRICT_ENV_VALIDATION && !isProductionBuild && (!restUrl || !restToken)) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production.");
  }

  return {
    restUrl: restUrl ?? null,
    restToken: restToken ?? null,
    provider: restUrl && restToken ? "upstash" : "memory",
  } as const;
}

export function getObservabilityEnv() {
  return {
    webhookUrl: env.OBSERVABILITY_WEBHOOK_URL ?? null,
    serviceName: env.OBSERVABILITY_SERVICE_NAME ?? "raidbase-web",
    environment: env.NODE_ENV,
  } as const;
}
