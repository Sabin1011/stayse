
import "dotenv/config";
import app from "./app.js";
import { connectToMongoDB } from "./infrastructure/database/mongodb/connection.js";

const PORT = Number(process.env.PORT) || 3001;

async function startServer(): Promise<void> {
  await connectToMongoDB();

  app.listen(PORT, () => {
    console.log(`Properties service running on port ${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start Properties Service:", error);
  process.exit(1);
});
