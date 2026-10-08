import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const leadScoreInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
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
        `Message length: ${messageLength}`,
      ],
    });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return res.status(400).json({
        error: "Invalid input",
        issues: err.issues,
      });
    }

    return res.status(500).json({
      error: err?.message ?? "Internal error",
    });
  }
}