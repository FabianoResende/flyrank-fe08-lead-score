import React from "react";
import dynamic from "next/dynamic";

const ChatRunner = dynamic(
  () => import("../../components/chat/ChatRunner"),
  { ssr: false }
);

export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Streaming Chat FE-06</h1>
      <ChatRunner />
    </main>
  );
}