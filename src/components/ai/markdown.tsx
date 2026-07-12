"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * 채팅 답변용 경량 마크다운 렌더러.
 * 지원: 제목(#), 굵게(별표 2개), 기울임(별표/밑줄), 인라인 코드(백틱), 링크([]()), 순서/비순서 목록, 문단/줄바꿈.
 */

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|(?:\*|_)[^*_]+(?:\*|_))/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) {
      nodes.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("`")) {
      nodes.push(
        <code key={k} className="rounded bg-black/5 px-1 py-0.5 text-[12.5px]">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("[")) {
      const mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
      if (mm) {
        const href = mm[2];
        const isInternal = href.startsWith("/");
        nodes.push(
          isInternal ? (
            <Link key={k} href={href} className="font-semibold text-klead-primary underline">
              {mm[1]}
            </Link>
          ) : (
            <a
              key={k}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-klead-primary underline"
            >
              {mm[1]}
            </a>
          ),
        );
      } else {
        nodes.push(tok);
      }
    } else {
      nodes.push(<em key={k}>{tok.slice(1, -1)}</em>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let key = 0;

  const flushPara = () => {
    if (!para.length) return;
    const joined = para.join("\n");
    blocks.push(
      <p key={`p-${key++}`} className="whitespace-pre-wrap leading-relaxed">
        {joined.split("\n").map((ln, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {renderInline(ln, `p${key}-${i}`)}
          </Fragment>
        ))}
      </p>,
    );
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const L = list;
    const Tag = L.ordered ? "ol" : "ul";
    blocks.push(
      <Tag
        key={`l-${key++}`}
        className={
          L.ordered
            ? "ml-4 list-decimal space-y-1 leading-relaxed"
            : "ml-4 list-disc space-y-1 leading-relaxed"
        }
      >
        {L.items.map((it, i) => (
          <li key={i}>{renderInline(it, `li${key}-${i}`)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);

    if (heading) {
      flushPara();
      flushList();
      blocks.push(
        <p key={`h-${key++}`} className="mt-1 text-[15px] font-bold">
          {renderInline(heading[2], `h${key}`)}
        </p>,
      );
    } else if (ol) {
      flushPara();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(ol[1]);
    } else if (ul) {
      flushPara();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(ul[1]);
    } else if (line.trim() === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();

  return <div className="space-y-2">{blocks}</div>;
}
