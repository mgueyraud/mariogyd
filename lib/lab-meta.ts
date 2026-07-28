import fs from "fs";
import { cache } from "react";
import path from "path";

/*
 * Frontmatter only — deliberately free of any component import.
 *
 * `lib/lab.tsx` pulls in the demo barrel to compile MDX, and every demo is a
 * `"use client"` island. Anything that imports it registers all sixteen of them
 * as client entry points, which is how the home page and the lab index ended up
 * shipping framer-motion and the whole demo library to render a list of titles.
 * Keep this file importing nothing but `fs`, `path`, and `react`.
 */

export const contentDir = path.join(
  process.cwd(),
  "app/(site)/lab/_lab-content"
);

const PER_PAGE = 4;

export type LabMeta = {
  slug: string;
  title: string;
  description: string;
  video: string;
  publishedDate: string;
  githubLink?: string;
};

// Minimal frontmatter reader — fields are simple `key: "value"` pairs.
// Avoids compiling MDX bodies just to build the index / home preview.
function parseFrontmatter(raw: string): Record<string, string> {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const out: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    out[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function readMeta(slug: string): LabMeta {
  const raw = fs.readFileSync(path.join(contentDir, slug + ".mdx"), "utf8");
  const fm = parseFrontmatter(raw);
  return {
    slug,
    title: fm.title ?? slug,
    description: fm.description ?? "",
    video: fm.video ?? "",
    publishedDate: fm.publishedDate ?? "",
    githubLink: fm.githubLink,
  };
}

/**
 * Newest first. Wrapped in `cache()` because a single render can ask for the
 * index several times (home preview, lab index, generateStaticParams) and each
 * call would otherwise re-read and re-parse every file on disk.
 */
export const getAllLabMeta = cache(function getAllLabMeta(): LabMeta[] {
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => readMeta(path.parse(f).name))
    .sort(
      (a, b) =>
        new Date(b.publishedDate).getTime() -
        new Date(a.publishedDate).getTime()
    );
});

export function getLabMetaPage({ page = 1 }: { page?: number } = {}) {
  const all = getAllLabMeta();
  const start = (page - 1) * PER_PAGE;
  return {
    posts: all.slice(start, start + PER_PAGE),
    numOfPages: Math.ceil(all.length / PER_PAGE),
    total: all.length,
  };
}
