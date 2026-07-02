import { Router, type Request, type Response } from "express";
import { logger } from "../lib/logger";

const router = Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8085";

async function proxyRequest(req: Request, res: Response): Promise<void> {
  const targetPath = "/ai" + req.path;
  const url = `${AI_SERVICE_URL}${targetPath}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("text/event-stream")) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Accel-Buffering", "no");
      res.setHeader("Connection", "keep-alive");

      if (!response.body) {
        res.status(502).json({ error: "No response body from AI service" });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      req.on("close", () => {
        reader.cancel().catch(() => {});
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
      res.end();
    } else {
      const body = await response.text();
      res.status(response.status).contentType(contentType || "application/json").send(body);
    }
  } catch (err) {
    logger.error({ err, url }, "AI service proxy error");
    res.status(502).json({
      error: "AI service unavailable",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}

router.all("/*path", (req, res) => {
  proxyRequest(req, res).catch((err) => {
    logger.error({ err }, "Unhandled proxy error");
    if (!res.headersSent) res.status(500).json({ error: "Internal proxy error" });
  });
});

export default router;
