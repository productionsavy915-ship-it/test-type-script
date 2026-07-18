import Redis from "ioredis";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

let redisClient: Redis | null = null;
const secretManagerClient = new SecretManagerServiceClient();

async function getSecret(name: string): Promise<string | undefined> {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
    if (!projectId) {
      console.warn("No Google Cloud Project ID found in environment (GOOGLE_CLOUD_PROJECT or GCP_PROJECT)");
      return undefined;
    }
    const [version] = await secretManagerClient.accessSecretVersion({
      name: `projects/${projectId}/secrets/${name}/versions/latest`,
    });
    
    return version.payload?.data?.toString();
  } catch (error) {
    console.error(`Error fetching secret ${name}:`, error);
    return undefined;
  }
}

export async function getRedisClient(): Promise<Redis> {
  if (redisClient) {
    return redisClient;
  }

  const isCloudRun = !!process.env.K_SERVICE;
  let redisHost: string | undefined = process.env.REDIS_HOST;
  let redisPort: string | undefined = process.env.REDIS_PORT;
  let redisUser: string | undefined = process.env.REDIS_USER;
  let redisPassword: string | undefined = process.env.REDIS_PASSWORD;
  let redisTls: boolean = process.env.REDIS_TLS === "true";

  if (isCloudRun) {
    if (!redisHost) redisHost = await getSecret("REDIS_HOST");
    if (!redisPort) redisPort = await getSecret("REDIS_PORT");
    if (!redisUser) redisUser = await getSecret("REDIS_USER");
    if (!redisPassword) redisPassword = await getSecret("REDIS_PASSWORD");
    // Jika di Cloud Run, kita asumsikan pakai TLS jika ada environment REDIS_TLS=true
    // atau kamu juga bisa mengambil boolean ini dari Secret Manager jika diperlukan
  }

  if (!redisHost || !redisPort) {
    throw new Error("REDIS_HOST and REDIS_PORT are not configured. Please set them as environment variables or secrets.");
  }

  redisClient = new Redis({
    host: redisHost,
    port: parseInt(redisPort, 10),
    ...(redisUser ? { username: redisUser } : {}),
    ...(redisPassword ? { password: redisPassword } : {}),
    ...(redisTls ? { tls: {} } : {}),
  });

  return redisClient;
}
