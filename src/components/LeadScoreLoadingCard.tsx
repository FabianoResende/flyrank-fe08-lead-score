import React from "react";

export default function LeadScoreLoadingCard() {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        padding: 20,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          height: 30,
          width: "40%",
          background: "#e5e7eb",
          borderRadius: 4,
          marginBottom: 16,
        }}
      />

      <div
        style={{
          height: 20,
          width: "80%",
          background: "#f3f4f6",
          borderRadius: 4,
          marginBottom: 12,
        }}
      />

      <div
        style={{
          height: 20,
          width: "60%",
          background: "#f3f4f6",
          borderRadius: 4,
          marginBottom: 12,
        }}
      />

      <div
        style={{
          height: 20,
          width: "70%",
          background: "#f3f4f6",
          borderRadius: 4,
        }}
      />
    </div>
  );
}