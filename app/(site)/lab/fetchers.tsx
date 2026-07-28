import fs from "fs";
import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import labComponents from "@/components/lab/LabComponents";

const contentDir = path.join(process.cwd(), "app/(site)/lab/_lab-content");

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

export function getAllLabMeta(): LabMeta[] {
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => readMeta(path.parse(f).name))
    .sort(
      (a, b) =>
        new Date(b.publishedDate).getTime() -
        new Date(a.publishedDate).getTime()
    );
}

export function getLabMetaPage(pageNum = 1) {
  const all = getAllLabMeta();
  const start = (pageNum - 1) * PER_PAGE;
  return {
    posts: all.slice(start, start + PER_PAGE),
    numOfPages: Math.ceil(all.length / PER_PAGE),
    total: all.length,
  };
}

export async function getLabPostBySlug(slug: string) {
  const fileName = slug + ".mdx";
  const filePath = path.join(contentDir, fileName);
  const fileContent = fs.readFileSync(filePath, "utf8");

  const { frontmatter, content } = await compileMDX<{
    title: string;
    description: string;
    author: string;
    publishedDate: string;
    video: string;
    githubLink?: string;
  }>({
    source: fileContent,
    options: { parseFrontmatter: true },
    components: {
      h1: (props) => <h2 {...props} className="font-semibold mb-2" />,
      p: (props) => <p {...props} className="font-light mb-1" />,
      a: (props) => (
        <a {...props} className="font-light underline" target="_blank" />
      ),
      li: (props) => <li {...props} className="font-light list-disc" />,
      ...labComponents,
    },
  });

  return {
    frontmatter,
    content,
    slug: path.parse(fileName).name,
  };
}
