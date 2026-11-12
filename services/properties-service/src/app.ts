import express from "express";

import hostApplicationRoutes from "./presentation/routes/host-application.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    service: "properties-service",
    status: "healthy",
  });
});

app.use("/host-applications", hostApplicationRoutes);

export default app;