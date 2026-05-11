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
  // Email provider (required in production for verification / password reset)
  EMAIL_FROM: optionalConfig,
  RESEND_API_KEY: optionalConfig,
  // Cloud storage for clips/avatars (required in production)
  STORAGE_PROVIDER: z.enum(["local", "s3", "r2", "supabase", "uploadthing"]).default("local"),
  STORAGE_BUCKET: optionalConfig,
  STORAGE_REGION: optionalConfig,
  STORAGE_ACCESS_KEY_ID: optionalConfig,
  STORAGE_SECRET_ACCESS_KEY: optionalConfig,
  STORAGE_ENDPOINT: optionalConfig,  // for R2 / custom S3-compatible
  STORAGE_PUBLIC_URL: optionalConfig, // base public CDN URL for stored files
  // Error tracking
  SENTRY_DSN: optionalConfig,
  // Analytics
  NEXT_PUBLIC_POSTHOG_KEY: optionalConfig,
  NEXT_PUBLIC_POSTHOG_HOST: optionalConfig,
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

export function getEmailEnv() {
  if (env.NODE_ENV === "production" && env.STRICT_ENV_VALIDATION && !isProductionBuild) {
    requiredInProduction("RESEND_API_KEY", env.RESEND_API_KEY);
    requiredInProduction("EMAIL_FROM", env.EMAIL_FROM);
  }
  return {
    apiKey: env.RESEND_API_KEY ?? null,
    from: env.EMAIL_FROM ?? "noreply@raidbase.gg",
  } as const;
}

export function getStorageEnv() {
  const provider = env.STORAGE_PROVIDER;
  if (env.NODE_ENV === "production" && env.STRICT_ENV_VALIDATION && !isProductionBuild && provider !== "local") {
    requiredInProduction("STORAGE_BUCKET", env.STORAGE_BUCKET);
    requiredInProduction("STORAGE_ACCESS_KEY_ID", env.STORAGE_ACCESS_KEY_ID);
    requiredInProduction("STORAGE_SECRET_ACCESS_KEY", env.STORAGE_SECRET_ACCESS_KEY);
  }
  return {
    provider,
    bucket: env.STORAGE_BUCKET ?? null,
    region: env.STORAGE_REGION ?? "auto",
    accessKeyId: env.STORAGE_ACCESS_KEY_ID ?? null,
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY ?? null,
    endpoint: env.STORAGE_ENDPOINT ?? null,
    publicUrl: env.STORAGE_PUBLIC_URL ?? null,
  } as const;
}

export function getSentryDsn() {
  return env.SENTRY_DSN ?? null;
}
