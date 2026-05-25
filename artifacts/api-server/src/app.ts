import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ TAMBAHKAN INI - Root path handler
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Contract Management API is running",
    endpoints: {
      api: "/api",
      health: "/health"
    }
  });
});

// ✅ TAMBAHKAN INI - Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "api-server"
  });
});

app.use("/api", router);

export default app;