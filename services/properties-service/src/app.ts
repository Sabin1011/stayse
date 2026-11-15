import express from "express";

import hostApplicationRoutes from "./presentation/routes/host-application.routes.js";

import adminHostApplicationRoutes from "./presentation/routes/admin-host-application.routes.js";

import { errorHandler } from "./presentation/middleware/error-handler.middleware.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    service: "properties-service",
    status: "healthy",
  });
});

// Host application routes
app.use("/host-applications", hostApplicationRoutes);

// Admin host application routes
app.use("/admin/host-applications", adminHostApplicationRoutes);

// Centralized error handler — MUST be registered after all routes
app.use(errorHandler);

export default app;