import { PrismaClient } from "../../../db/generated/prisma";
import "dotenv/config";

const DB_SERVICE_URL = process.env.DB_SERVICE_URL || "http://localhost:4010";

// A Proxy that converts prisma.model.operation(args) into HTTP requests
const createDbProxy = () => {
  return new Proxy({}, {
    get(target, modelName) {
      if (modelName === '$connect' || modelName === '$disconnect') {
        return async () => {};
      }
      
      return new Proxy({}, {
        get(modelTarget, operation) {
          return async (args) => {
            const response = await fetch(`${DB_SERVICE_URL}/query`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ model: modelName, operation, args })
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(`DB Service Error: ${error.error}`);
            }

            return response.json();
          };
        }
      });
    }
  }) as unknown as PrismaClient;
};

export const prisma = createDbProxy();
