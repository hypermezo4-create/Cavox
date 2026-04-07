"use client";

import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: next })
    });

    const data = await res.json();
    setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    setLoading(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button onClick={() => setOpen(!open)} className="rounded-full bg-[var(--accent-primary)] px-4 py-3 text-[var(--btn-primary-text)]">💬</button>
      {open && (
        <div className="mt-2 w-80 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-3 text-[var(--text-primary)]">
          <div className="max-h-64 space-y-2 overflow-auto">
            {messages.map((m, i) => <p key={i} className="text-sm"><b>{m.role}:</b> {m.content}</p>)}
            {loading && <p className="text-[var(--text-muted)]">Typing...</p>}
          </div>
          <div className="mt-2 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded border border-[var(--input-border)] bg-[var(--input-bg)] p-2" />
            <button onClick={send} className="rounded bg-[var(--btn-primary-bg)] px-3 py-2 text-[var(--btn-primary-text)]">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
