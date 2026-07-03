import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
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
const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-code-review-assistant-2-qbjh.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

console.log("Allowed Origins at startup:", allowedOrigins);

app.use(
  cors({
    origin(origin, callback) {
      console.log("Incoming Origin:", JSON.stringify(origin));

      if (!origin) {
        return callback(null, true);
      }

      console.log(
        "Matches?",
        allowedOrigins.map((o) => ({
          allowed: o,
          equal: o === origin,
        }))
      );

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked Origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use((err: any, req: any, res: any, next: any) => {
  logger.error({ err }, "Express route error handler");
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

export default app;
