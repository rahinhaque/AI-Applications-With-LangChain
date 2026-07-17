import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: "This is a placeholder reply from Rahin's Agent.",
        },
      ]);
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#07080f] text-slate-100">
      {/* Ambient gradient blobs */}
      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        .blob { animation: drift 14s ease-in-out infinite; }
      `}</style>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-violet-600/30 blur-[100px]" />
        <div
          className="blob absolute top-1/3 -right-24 w-[26rem] h-[26rem] rounded-full bg-cyan-500/25 blur-[110px]"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="blob absolute -bottom-32 left-1/3 w-[24rem] h-[24rem] rounded-full bg-fuchsia-600/25 blur-[100px]"
          style={{ animationDelay: "6s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {hasMessages && (
          <header className="border-b border-white/10 backdrop-blur-md py-4 px-6">
            <h1 className="text-lg font-semibold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Rahin's Agent
            </h1>
          </header>
        )}

        <main
          className={`flex-1 overflow-y-auto px-4 ${
            hasMessages
              ? "flex flex-col justify-start py-6"
              : "flex flex-col items-center justify-center"
          }`}
        >
          {!hasMessages ? (
            <div className="flex flex-col items-center gap-6 text-center w-full max-w-xl">
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.35)]">
                Rahin's Agent
              </h1>
              <p className="text-slate-400 text-sm">
                Start a conversation with Rahin's Agent
              </p>

              <InputBar
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                handleKeyDown={handleKeyDown}
              />

              <p className="text-xs text-slate-500 max-w-sm">
                The responses may include inaccurate information about people,
                places, or facts.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl w-full mx-auto flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "agent" && (
                    <div className="w-7 h-7 mr-2 shrink-0 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                        : "bg-white/5 border border-white/10 backdrop-blur-md text-slate-100"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          )}
        </main>

        {hasMessages && (
          <footer className="px-4 pb-6 pt-2">
            <div className="max-w-3xl mx-auto flex flex-col items-center">
              <InputBar
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                handleKeyDown={handleKeyDown}
                full
              />
              <p className="text-center text-xs text-slate-500 mt-2">
                The responses may include inaccurate information about people,
                places, or facts.
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

function InputBar({ input, setInput, handleSend, handleKeyDown, full }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl px-4 py-3 bg-white/5 border border-white/10 backdrop-blur-md
        focus-within:border-violet-400/60 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.25)]
        transition-all duration-300 ${full ? "w-full" : "w-full max-w-md"}`}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Send a message..."
        className="flex-1 bg-transparent outline-none text-slate-100 placeholder-slate-500 text-sm"
      />
      <button
        onClick={handleSend}
        disabled={!input.trim()}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-slate-950 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
        </svg>
      </button>
    </div>
  );
}

export default App;
