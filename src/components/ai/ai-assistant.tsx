"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KLEAD_AI_GREETING,
  KLEAD_AI_STARTERS,
  KLEAD_AI_NUDGE,
} from "@/lib/ai/persona";
import { Markdown } from "@/components/ai/markdown";

type Card =
  | { kind: "course"; title: string; subtitle: string; price: string; href: string }
  | { kind: "curator"; title: string; subtitle: string; href: string }
  | { kind: "program"; title: string; subtitle: string; price: string; href: string };

interface Msg {
  role: "user" | "assistant";
  content: string;
  cards?: Card[];
}

interface Thread {
  id: string; // 로컬 식별자
  convId: string | null; // OpenAI conversation id (문맥 유지)
  title: string;
  updatedAt: number;
  messages: Msg[];
}

const IDLE_MS = 20_000;
const LS_KEY = "klead_ai_threads_v1";
const MAX_THREADS = 20;

function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Thread[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `t-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** 이벤트 시점 타임스탬프(모듈 스코프 헬퍼 — 렌더 순수성 분석에서 제외) */
function now(): number {
  return Date.now();
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? `오늘 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    : `${d.getMonth() + 1}.${d.getDate()}`;
}

export function AiAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [nudge, setNudge] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const openedOnce = useRef(false);
  const hydrated = useRef(false);

  const current = threads.find((t) => t.id === currentId) ?? null;
  const messages = current?.messages ?? [];
  const sorted = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);

  // 최초 로드: localStorage에서 대화 기록 복원 (비로그인도 기억)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setThreads(loadThreads());
      hydrated.current = true;
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // 변경 시 저장
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(threads.slice(0, MAX_THREADS)));
    } catch {
      /* 저장 실패 무시 */
    }
  }, [threads]);

  // 유휴 20초 → 말풍선
  useEffect(() => {
    function arm() {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (!openedOnce.current) setNudge(true);
      }, IDLE_MS);
    }
    function onInteract() {
      setNudge(false);
      if (!openedOnce.current) arm();
    }
    arm();
    const evs: (keyof WindowEventMap)[] = ["scroll", "pointerdown", "keydown"];
    evs.forEach((e) => window.addEventListener(e, onInteract, { passive: true }));
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      evs.forEach((e) => window.removeEventListener(e, onInteract));
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [currentId, threads, sending, open, view]);

  function openPanel() {
    setOpen(true);
    setNudge(false);
    setView("chat");
    openedOnce.current = true;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    // 이어보기: 이전 대화가 있으면 가장 최근 대화를 연다
    setCurrentId((cur) => {
      if (cur) return cur;
      const recent = [...loadThreads()].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      return recent?.id ?? null;
    });
  }

  function startNew() {
    setCurrentId(null);
    setView("chat");
  }

  function deleteThread(id: string) {
    setThreads((ts) => ts.filter((t) => t.id !== id));
    setCurrentId((c) => (c === id ? null : c));
  }

  async function send(text: string) {
    {
      const msg = text.trim();
      if (!msg || sending) return;
      setInput("");
      setSending(true);
      setView("chat");

      // 현재 스레드 확보(없으면 생성)
      let threadId = currentId;
      let convId = current?.convId ?? null;
      if (!threadId) {
        threadId = newId();
        const t: Thread = {
          id: threadId,
          convId: null,
          title: msg.slice(0, 24),
          updatedAt: now(),
          messages: [],
        };
        setThreads((ts) => [t, ...ts]);
        setCurrentId(threadId);
        convId = null;
      }

      // 사용자 메시지 추가
      setThreads((ts) =>
        ts.map((t) =>
          t.id === threadId
            ? { ...t, updatedAt: now(), messages: [...t.messages, { role: "user", content: msg }] }
            : t,
        ),
      );

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: convId ?? undefined,
            message: msg,
            pageContext: typeof document !== "undefined" ? document.title : pathname,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "오류");
        setThreads((ts) =>
          ts.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  convId: data.conversationId ?? t.convId,
                  updatedAt: now(),
                  messages: [
                    ...t.messages,
                    { role: "assistant", content: data.reply, cards: data.cards ?? [] },
                  ],
                }
              : t,
          ),
        );
      } catch (e) {
        const errText = e instanceof Error ? e.message : "잠시 문제가 생겼어요. 다시 시도해 주세요.";
        setThreads((ts) =>
          ts.map((t) =>
            t.id === threadId
              ? { ...t, messages: [...t.messages, { role: "assistant", content: errText }] }
              : t,
          ),
        );
      } finally {
        setSending(false);
      }
    }
  }

  return (
    <>
      {/* 플로팅 버튼 + 말풍선 */}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-2 lg:bottom-7 lg:right-7">
        {nudge && !open && (
          <button
            onClick={openPanel}
            className="max-w-[220px] animate-[fadeInUp_0.4s_ease] rounded-2xl rounded-br-sm bg-white px-4 py-2.5 text-left text-[13px] font-medium text-[#161616] shadow-[0_8px_30px_rgba(0,0,0,0.14)] ring-1 ring-black/5"
          >
            {KLEAD_AI_NUDGE}
          </button>
        )}
        {!open && (
          <button
            onClick={openPanel}
            aria-label="AI 상담사 열기"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-klead-primary to-[#c084fc] text-white shadow-[0_10px_30px_rgba(124,58,237,0.45)] transition-transform hover:scale-105"
          >
            <span className="text-[11px] font-bold leading-none">
              AI<span className="ml-0.5 align-top text-[10px]">✨</span>
            </span>
          </button>
        )}
      </div>

      {/* 패널 */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-end p-0 sm:inset-auto sm:bottom-7 sm:right-7">
          <div className="flex h-[80vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:h-[600px] sm:w-[400px] sm:rounded-2xl">
            {/* 헤더 */}
            <header className="flex items-center justify-between bg-gradient-to-br from-klead-primary to-[#c084fc] px-4 py-4 text-white">
              <div className="flex items-center gap-2">
                {view === "history" && (
                  <button onClick={() => setView("chat")} aria-label="뒤로" className="rounded-full p-1 hover:bg-white/20">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <div>
                  <p className="text-[15px] font-bold">
                    {view === "history" ? "대화 기록" : "클리드 AI 상담사 · 클리"}
                  </p>
                  {view === "chat" && (
                    <p className="text-[12px] text-white/80">뷰티 커리어, 함께 설계해요 ✨</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {view === "chat" && (
                  <>
                    <button onClick={startNew} aria-label="새 대화" className="rounded-full p-1.5 hover:bg-white/20">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button onClick={() => setView("history")} aria-label="대화 기록" className="rounded-full p-1.5 hover:bg-white/20">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
                      </svg>
                    </button>
                  </>
                )}
                <button onClick={() => setOpen(false)} aria-label="닫기" className="rounded-full p-1.5 hover:bg-white/20">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </header>

            {/* 대화 기록 목록 */}
            {view === "history" ? (
              <div className="flex-1 overflow-y-auto bg-[#faf7fb] px-3 py-4">
                {sorted.length === 0 ? (
                  <p className="mt-10 text-center text-[13px] text-klead-gray-400">
                    아직 저장된 대화가 없어요.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {sorted.map((t) => {
                      const preview = t.messages.find((m) => m.role === "assistant")?.content ?? "";
                      return (
                        <li key={t.id}>
                          <div className="group flex items-center gap-2 rounded-xl border border-black/10 bg-white p-3 transition hover:border-klead-primary/40">
                            <button
                              onClick={() => {
                                setCurrentId(t.id);
                                setView("chat");
                              }}
                              className="min-w-0 flex-1 text-left"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-[14px] font-semibold text-[#161616]">
                                  {t.title || "대화"}
                                </p>
                                <span className="shrink-0 text-[11px] text-klead-gray-400">
                                  {fmtTime(t.updatedAt)}
                                </span>
                              </div>
                              <p className="mt-0.5 truncate text-[12px] text-klead-gray-500">
                                {preview.replace(/[#*`]/g, "") || "…"}
                              </p>
                            </button>
                            <button
                              onClick={() => deleteThread(t.id)}
                              aria-label="삭제"
                              className="shrink-0 rounded-md p-1.5 text-klead-gray-400 hover:bg-black/5 hover:text-red-500"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : (
              <>
                {/* 대화 본문 */}
                <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-[#faf7fb] px-4 py-5">
                  <Bubble role="assistant">{KLEAD_AI_GREETING}</Bubble>
                  {messages.length === 0 && (
                    <div className="flex flex-wrap gap-2">
                      {KLEAD_AI_STARTERS.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => send(s.message)}
                          className="rounded-full border border-klead-primary/30 bg-white px-3.5 py-2 text-[13px] font-medium text-klead-primary transition hover:bg-klead-primary/5"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {messages.map((m, i) => (
                    <div key={i} className="space-y-2">
                      <Bubble role={m.role}>{m.content}</Bubble>
                      {m.cards && m.cards.length > 0 && (
                        <div className="space-y-2">
                          {m.cards.map((c, j) => (
                            <CardView key={j} card={c} onNavigate={() => setOpen(false)} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {sending && (
                    <Bubble role="assistant">
                      <span className="inline-flex gap-1">
                        <Dot /> <Dot d={0.15} /> <Dot d={0.3} />
                      </span>
                    </Bubble>
                  )}
                </div>

                {/* 입력 */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="flex items-center gap-2 border-t border-black/10 bg-white px-3 py-3"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="궁금한 점을 편하게 물어보세요"
                    className="flex-1 rounded-full border border-black/15 px-4 py-2.5 text-[14px] focus:border-klead-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-klead-primary text-white transition hover:opacity-90 disabled:opacity-40"
                    aria-label="보내기"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 12l16-8-6 16-3-7-7-1z" strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-klead-primary px-3.5 py-2.5 text-[14px] leading-relaxed text-white">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-[14px] text-[#161616] ring-1 ring-black/5">
        {typeof children === "string" ? <Markdown text={children} /> : children}
      </div>
    </div>
  );
}

function CardView({ card, onNavigate }: { card: Card; onNavigate: () => void }) {
  const cta =
    card.kind === "curator" ? "프로필 보기" : card.kind === "program" ? "구독 보기" : "강의 보기";
  return (
    <Link
      href={card.href}
      onClick={onNavigate}
      className="block rounded-xl border border-klead-primary/20 bg-white p-3.5 transition hover:border-klead-primary/50 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[14px] font-bold text-[#161616]">{card.title}</p>
        {"price" in card && (
          <span className="shrink-0 text-[12px] font-semibold text-klead-primary">{card.price}</span>
        )}
      </div>
      {card.subtitle && (
        <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-klead-gray-500">
          {card.subtitle}
        </p>
      )}
      <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-klead-primary">
        {cta} →
      </span>
    </Link>
  );
}

function Dot({ d = 0 }: { d?: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full bg-klead-gray-400"
      style={{ animation: `pulse 1s ${d}s infinite` }}
    />
  );
}
