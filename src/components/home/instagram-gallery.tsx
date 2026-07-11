"use client";

import Image from "next/image";
import { useState } from "react";

export interface InstaPost {
  image: string;
  href: string;
  caption?: string;
}

const STEP = 9;

export function InstagramGallery({ posts }: { posts: InstaPost[] }) {
  const [count, setCount] = useState(STEP);
  const shown = posts.slice(0, count);
  const hasMore = count < posts.length;

  return (
    <div>
      <div className="grid grid-cols-3 gap-[10px]">
        {shown.map((post, i) => (
          <a
            key={post.href + i}
            href={post.href || undefined}
            target={post.href ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="group relative aspect-[418/558] overflow-hidden bg-[#111]"
          >
            <Image
              src={post.image}
              alt={post.caption || "클리드 인스타그램 게시물"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width:640px) 33vw, 430px"
            />
            {post.caption && (
              <div className="absolute inset-0 flex items-center justify-center overflow-y-auto bg-black/70 p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="whitespace-pre-line text-center text-[12px] leading-relaxed text-white">
                  {post.caption}
                </p>
              </div>
            )}
          </a>
        ))}
      </div>

      {hasMore && (
        <div className="mt-14 text-center">
          <button
            type="button"
            onClick={() => setCount((c) => c + STEP)}
            className="rounded-full bg-black px-10 py-3.5 text-[15px] font-medium text-white transition-transform hover:scale-105"
          >
            더보기 +
          </button>
        </div>
      )}
    </div>
  );
}
