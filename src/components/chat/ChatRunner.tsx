import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  FormEvent,
  UIEvent,
} from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ApiMessage = {
  role: "user" | "assistant";
  content: string;
};

const BOTTOM_THRESHOLD = 48;

export default function ChatRunner() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! Sou seu assistente de IA.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [isPinnedToBottom, setIsPinnedToBottom] =
    useState(true);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  const messagesContainerRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container || !isPinnedToBottom) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "auto",
    });
  }, [messages, isPinnedToBottom]);

  function stopStreaming() {
    abortControllerRef.current?.abort();
  }

  function isNearBottom(
    container: HTMLDivElement
  ): boolean {
    const distanceFromBottom =
      container.scrollHeight -
      container.clientHeight -
      container.scrollTop;

    return distanceFromBottom <= BOTTOM_THRESHOLD;
  }

  function handleMessagesScroll(
    event: UIEvent<HTMLDivElement>
  ) {
    const container = event.currentTarget;

    setIsPinnedToBottom(
      isNearBottom(container)
    );
  }

  function jumpToLatestMessage() {
    const container = messagesContainerRef.current;

    if (!container) {
      return;
    }

    setIsPinnedToBottom(true);

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const content = input.trim();

    if (!content || isStreaming) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    const assistantMessageId =
      crypto.randomUUID();

    const emptyAssistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    const conversationHistory: ApiMessage[] =
      messages
        .filter((message) => {
          return (
            message.id !== "welcome" &&
            message.content.trim().length > 0
          );
        })
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

    const requestMessages: ApiMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content,
      },
    ];

    const controller = new AbortController();

    abortControllerRef.current = controller;

    setIsPinnedToBottom(true);

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      emptyAssistantMessage,
    ]);

    setInput("");
    setError(null);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: requestMessages,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const responseData = (await response
          .json()
          .catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(
          responseData?.error ??
            "Não foi possível iniciar a resposta."
        );
      }

      if (!response.body) {
        throw new Error(
          "O servidor não retornou um fluxo de dados."
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const result = await reader.read();

        if (result.done) {
          break;
        }

        const chunk = decoder.decode(
          result.value,
          {
            stream: true,
          }
        );

        setMessages((currentMessages) =>
          currentMessages.map((message) => {
            if (
              message.id !== assistantMessageId
            ) {
              return message;
            }

            return {
              ...message,
              content:
                message.content + chunk,
            };
          })
        );
      }

      const remainingText = decoder.decode();

      if (remainingText) {
        setMessages((currentMessages) =>
          currentMessages.map((message) => {
            if (
              message.id !== assistantMessageId
            ) {
              return message;
            }

            return {
              ...message,
              content:
                message.content +
                remainingText,
            };
          })
        );
      }
    } catch (caughtError) {
      const requestWasStopped =
        caughtError instanceof DOMException &&
        caughtError.name === "AbortError";

      if (!requestWasStopped) {
        setMessages((currentMessages) =>
          currentMessages.filter((message) => {
            return (
              message.id !==
              assistantMessageId
            );
          })
        );

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Ocorreu um erro desconhecido."
        );
      }
    } finally {
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 800,
        margin: "24px auto",
        padding: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        boxSizing: "border-box",
      }}
    >
      <h2>Streaming Chat FE-06</h2>

      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        aria-live="polite"
        aria-label="Histórico da conversa"
        style={{
          maxHeight: 420,
          overflowY: "auto",
          paddingRight: 4,
          overscrollBehavior: "contain",
        }}
      >
        {messages.map((message) => {
          const messageText =
            message.content ||
            (isStreaming
              ? "Pensando..."
              : "");

          return (
            <div
              key={message.id}
              style={{
                padding: 12,
                marginBottom: 8,
                borderRadius: 8,
                backgroundColor:
                  message.role === "assistant"
                    ? "#f3f4f6"
                    : "#dbeafe",
              }}
            >
              <strong>
                {message.role === "assistant"
                  ? "Assistant"
                  : "User"}
              </strong>

              <p
                style={{
                  marginBottom: 0,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {messageText}
              </p>
            </div>
          );
        })}
      </div>

      {!isPinnedToBottom && (
        <button
          type="button"
          onClick={jumpToLatestMessage}
          style={{
            display: "block",
            margin: "8px auto 0",
            padding: "8px 12px",
            border: "1px solid #9ca3af",
            borderRadius: 999,
            backgroundColor: "#ffffff",
            cursor: "pointer",
          }}
        >
          Ir para a última mensagem
        </button>
      )}

      {error && (
        <p
          role="alert"
          style={{
            color: "#b91c1c",
          }}
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 8,
          marginTop: 16,
          flexWrap: "wrap",
        }}
      >
        <label
          htmlFor="chat-message"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
          }}
        >
          Digite sua mensagem
        </label>

        <input
          id="chat-message"
          type="text"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
          }}
          placeholder="Digite sua mensagem..."
          autoComplete="off"
          disabled={isStreaming}
          style={{
            flex: "1 1 240px",
            minWidth: 0,
            padding: 12,
            border: "1px solid #d1d5db",
            borderRadius: 8,
            boxSizing: "border-box",
          }}
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={stopStreaming}
            style={{
              padding: "12px 18px",
              borderRadius: 8,
              cursor: "pointer",
              color: "#ffffff",
              backgroundColor: "#b91c1c",
              border: "1px solid #991b1b",
            }}
          >
            Parar
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              padding: "12px 18px",
              borderRadius: 8,
              cursor: input.trim()
                ? "pointer"
                : "not-allowed",
            }}
          >
            Enviar
          </button>
        )}
      </form>
    </div>
  );
}