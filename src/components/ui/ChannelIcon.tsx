"use client";

import { useState } from "react";
import { TbDirection, TbWorld } from "react-icons/tb";

const SIZE = 16;

const DOMAIN_MAP: Record<string, string> = {
  google: "google.com",
  bing: "bing.com",
  yahoo: "yahoo.com",
  duckduckgo: "duckduckgo.com",
  yandex: "yandex.com",
  baidu: "baidu.com",
  facebook: "facebook.com",
  instagram: "instagram.com",
  twitter: "twitter.com",
  x: "x.com",
  linkedin: "linkedin.com",
  reddit: "reddit.com",
  youtube: "youtube.com",
  tiktok: "tiktok.com",
  pinterest: "pinterest.com",
  github: "github.com",
  medium: "medium.com",
  hackernews: "news.ycombinator.com",
  "hacker news": "news.ycombinator.com",
  producthunt: "producthunt.com",
  "product hunt": "producthunt.com",
};

function resolveDomain(name = "") {
  const value = name.trim().toLowerCase();
  if (!value) return null;
  if (DOMAIN_MAP[value]) return DOMAIN_MAP[value];
  try {
    if (value.startsWith("http")) return new URL(value).hostname;
  } catch {
    return null;
  }
  if (value.includes(".")) return value.replace(/^www\./, "");
  return null;
}

export default function ChannelIcon({ name }: { name?: string | null }) {
  const [failed, setFailed] = useState(false);
  const value = (name || "").trim().toLowerCase();

  if (value === "direct" || value === "(direct)" || value === "") {
    return (
      <span className="inline-flex size-4 shrink-0 items-center justify-center text-[var(--text-secondary)]">
        <TbDirection size={SIZE} />
      </span>
    );
  }

  const domain = resolveDomain(name || "");
  if (!domain || failed) {
    return (
      <span className="inline-flex size-4 shrink-0 items-center justify-center text-[var(--text-secondary)]">
        <TbWorld size={SIZE} />
      </span>
    );
  }

  return (
    <span className="inline-flex size-4 shrink-0 items-center justify-center text-[var(--text-secondary)]">
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        width={SIZE}
        height={SIZE}
        className="size-4 rounded-[3px] object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
