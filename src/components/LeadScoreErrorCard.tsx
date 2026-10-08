import React from "react";

export default function LeadScoreErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      style={{
        border: "1px solid #fecaca",
        background: "#fef2f2",
        padding: 20,
        borderRadius: 8,
      }}
    >
      <h3
        style={{
          marginTop: 0,
          color: "#b91c1c",
        }}
      >
        Não foi possível executar a análise
      </h3>

      <p
        style={{
          marginBottom: 16,
        }}
      >
        {message}
      </p>

      <button
        onClick={onRetry}
        style={{
          padding: "8px 12px",
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}