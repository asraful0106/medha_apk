// @/src/config/envVars.tsx
interface TEnvVar {
  BASE_URL: string;
  ENVIRONMENT: "dev" | "prod";
}

export const envVars: TEnvVar = {
  // BASE_URL:
  //   "https://velvet-yours-coordination-terminals.trycloudflare.com/api/v1",
  BASE_URL: "http://192.168.11.21:3001/api/v1",
  ENVIRONMENT: "dev",
};
