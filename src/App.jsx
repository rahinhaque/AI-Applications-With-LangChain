import { useState, useRef, useEffect } from "react";
import "./App.css";
import { getAnswer } from "./langchain";
import { authClient } from "./lib/auth-client";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState("chat"); // "chat" | "signin" | "signup"
  const scrollRef = useRef(null);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setIsLoading(true);

    const reply = await getAnswer(trimmed);

    setMessages((prev) => [...prev, { role: "agent", text: reply }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  const handleHomeClick = () => {
    setMessages([]);
    setCurrentView("chat");
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#07080f] text-slate-100">
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

      <div className="relative z-10 flex flex-col h-full font-sans">
        <header className="border-b border-white/10 backdrop-blur-md py-4 px-6 flex justify-between items-center relative z-20">
          <button 
            onClick={handleHomeClick}
            className="text-lg font-semibold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-all duration-200 outline-none"
          >
            Rahin's Agent
          </button>
          
          <div className="flex items-center gap-4">
            {isPending ? (
              <span className="text-xs text-slate-500">Loading...</span>
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-xs font-medium text-slate-200">{session?.user?.name}</span>
                  <span className="text-[10px] text-slate-400">{session?.user?.email}</span>
                </div>
                <button
                  onClick={async () => {
                    await authClient.signOut();
                    setMessages([]);
                  }}
                  className="px-3 py-1.5 text-xs rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView("signin")}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-slate-950 hover:opacity-90 shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        <main
          className={`flex-1 overflow-y-auto px-4 ${
            currentView === "chat" && hasMessages
              ? "flex flex-col justify-start py-6"
              : "flex flex-col items-center justify-center"
          }`}
        >
          {currentView === "signin" && (
            <SignInCard setCurrentView={setCurrentView} />
          )}

          {currentView === "signup" && (
            <SignUpCard setCurrentView={setCurrentView} />
          )}

          {currentView === "chat" && !hasMessages && (
            <div className="flex flex-col items-center gap-6 text-center w-full max-w-xl">
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.35)]">
                Rahin's Agent
              </h1>
              <p className="text-slate-400 text-sm">
                {session?.user ? `Welcome back, ${session?.user?.name}! Start a conversation with Rahin's Agent` : "Start a conversation with Rahin's Agent"}
              </p>

              <InputBar
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                handleKeyDown={handleKeyDown}
                isLoading={isLoading}
              />

              <p className="text-xs text-slate-500 max-w-sm">
                The responses may include inaccurate information about people,
                places, or facts.
              </p>
            </div>
          )}

          {currentView === "chat" && hasMessages && (
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

              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 mr-2 shrink-0 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                  <div className="rounded-2xl px-4 py-2.5 bg-white/5 border border-white/10 backdrop-blur-md flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </main>

        {currentView === "chat" && hasMessages && (
          <footer className="px-4 pb-6 pt-2">
            <div className="max-w-3xl mx-auto flex flex-col items-center">
              <InputBar
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                handleKeyDown={handleKeyDown}
                isLoading={isLoading}
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

function InputBar({
  input,
  setInput,
  handleSend,
  handleKeyDown,
  isLoading,
  full,
}) {
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
        disabled={isLoading}
        className="flex-1 bg-transparent outline-none text-slate-100 placeholder-slate-500 text-sm disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={!input.trim() || isLoading}
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

function SignInCard({ setCurrentView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data, error: apiError } = await authClient.signIn.email({
        email,
        password,
      });
      if (apiError) {
        setError(apiError.message || "Invalid credentials.");
      } else {
        setCurrentView("chat");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative">
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent mb-6">
        Welcome Back
      </h2>
      {error && (
        <div className="mb-4 p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl font-sans">
          {error}
        </div>
      )}
      <form onSubmit={handleSignIn} className="flex flex-col gap-4 font-sans">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="you@example.com"
            className="w-full rounded-xl px-4 py-2.5 bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:border-violet-400/60 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
            className="w-full rounded-xl px-4 py-2.5 bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:border-violet-400/60 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] outline-none transition-all"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-2.5 font-semibold rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-slate-950 hover:opacity-95 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all cursor-pointer flex justify-center items-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      <div className="mt-6 text-center text-xs text-slate-400 font-sans">
        Don't have an account?{" "}
        <button
          onClick={() => setCurrentView("signup")}
          className="text-violet-300 hover:underline cursor-pointer"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}

function SignUpCard({ setCurrentView }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data, error: apiError } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      if (apiError) {
        setError(apiError.message || "Failed to sign up.");
      } else {
        setCurrentView("chat");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative">
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent mb-6">
        Create Account
      </h2>
      {error && (
        <div className="mb-4 p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl font-sans">
          {error}
        </div>
      )}
      <form onSubmit={handleSignUp} className="flex flex-col gap-4 font-sans">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            placeholder="John Doe"
            className="w-full rounded-xl px-4 py-2.5 bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:border-violet-400/60 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="you@example.com"
            className="w-full rounded-xl px-4 py-2.5 bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:border-violet-400/60 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] outline-none transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="•••••••• (min 8 chars)"
            className="w-full rounded-xl px-4 py-2.5 bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:border-violet-400/60 focus:shadow-[0_0_20px_rgba(168,85,247,0.15)] outline-none transition-all"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-2.5 font-semibold rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-slate-950 hover:opacity-95 shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all cursor-pointer flex justify-center items-center gap-2"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sign Up"
          )}
        </button>
      </form>
      <div className="mt-6 text-center text-xs text-slate-400 font-sans">
        Already have an account?{" "}
        <button
          onClick={() => setCurrentView("signin")}
          className="text-violet-300 hover:underline cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

export default App;
