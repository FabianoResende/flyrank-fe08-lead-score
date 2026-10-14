import type {
  NextApiRequest,
  NextApiResponse,
} from "next";

import {
  createGeminiClient,
  GEMINI_MODEL,
  SYSTEM_PROMPT,
} from "../../server/ai/geminiConfig";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages?: unknown;
};

type ErrorResponse = {
  error: string;
};

type GeminiContent = {
  role: "user" | "model";
  parts: Array<{
    text: string;
  }>;
};

export const config = {
  api: {
    responseLimit: false,
  },
};

function isChatMessage(
  value: unknown
): value is ChatMessage {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const candidate = value as Record<
    string,
    unknown
  >;

  const validRole =
    candidate.role === "user" ||
    candidate.role === "assistant";

  const validContent =
    typeof candidate.content === "string" &&
    candidate.content.trim().length > 0;

  return validRole && validContent;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);

    res.status(405).json({
      error: "Method not allowed",
    });

    return;
  }

  const body = req.body as ChatRequestBody;

  if (
    !Array.isArray(body.messages) ||
    body.messages.length === 0 ||
    !body.messages.every(isChatMessage)
  ) {
    res.status(400).json({
      error:
        "O histórico da conversa é obrigatório.",
    });

    return;
  }

  const lastMessage =
    body.messages[body.messages.length - 1];

  if (lastMessage.role !== "user") {
    res.status(400).json({
      error:
        "A última mensagem deve ser do usuário.",
    });

    return;
  }

  const contents: GeminiContent[] =
    body.messages.map((message) => ({
      role:
        message.role === "assistant"
          ? "model"
          : "user",
      parts: [
        {
          text: message.content.trim(),
        },
      ],
    }));

  try {
    const gemini = createGeminiClient();

    const stream =
      await gemini.models.generateContentStream({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          maxOutputTokens: 500,
        },
      });

    res.writeHead(200, {
      "Content-Type":
        "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Encoding": "none",
      "X-Accel-Buffering": "no",
    });

    for await (const chunk of stream) {
      const text = chunk.text;

      if (text) {
        res.write(text);
      }
    }

    res.end();
  } catch (caughtError) {
    console.error(
      "Gemini streaming error:",
      caughtError
    );

    if (!res.headersSent) {
      res.status(500).json({
        error:
          "Não foi possível gerar a resposta da IA.",
      });

      return;
    }

    res.end();
  }
}