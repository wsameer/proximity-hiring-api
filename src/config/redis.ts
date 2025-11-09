/**
 * Redis client configuration
 * Used for: presence tracking, caching, job queues
 */
import { createClient } from "redis";
import { env } from "./env.js";

const redisUrl = env.REDIS_URL || "redis://localhost:6379";

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
});

// Connect to Redis
export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

// Graceful shutdown
export async function disconnectRedis() {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}
