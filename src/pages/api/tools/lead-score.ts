import type { NextApiRequest, NextApiResponse } from "next";
import rateLimit from "express-rate-limit";
import { z } from "zod";

const leadScoreInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

const limiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  keyGenerator: (req: any) => {
    return (
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      "local-dev"
    );
  },
  skipFailedRequests: true,
});

function applyRateLimit(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((resolve, reject) => {
    limiter(req as any, res as any, (result: any) => {
      if (result instanceof Error) reject(result);
      else resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await applyRateLimit(req, res);

    const parsed = leadScoreInputSchema.parse(req.body);

    const nameLength = parsed.name.length;
    const messageLength = parsed.message.length;

    const score = nameLength * 2 + messageLength;
    let category: "cold" | "warm" | "hot" = "cold";

    if (score >= 80) category = "hot";
    else if (score >= 50) category = "warm";

    return res.status(200).json({
      score,
      category,
      reasons: [
        `Name length: ${nameLength}`,
        `Message length: ${messageLength}`
      ]
    });

  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({
        error: "Invalid input",
        issues: err.issues,
      });
    }

    return res.status(500).json({
      error: err?.message ?? "Internal error"
    });
  }
}
