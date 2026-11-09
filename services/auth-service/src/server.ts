import "dotenv/config";
import app from "./app.js";
import "./config/env.js";


const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Auth Service running on port ${PORT}`);
});
