// JWT secret must come from the environment. A dev-only fallback keeps local
// setup frictionless, but a warning is emitted so it is never silently used
// in a real deployment.
function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length > 0) {
    return secret;
  }
  console.warn(
    "[config] JWT_SECRET is not set. Using an insecure development fallback. " +
      "Set JWT_SECRET in the environment for any non-local use."
  );
  return "dev-only-insecure-secret-change-me";
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
};
