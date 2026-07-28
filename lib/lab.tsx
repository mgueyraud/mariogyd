import fs from "fs";
import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import labComponents from "@/components/lab/demos";
import { contentDir } from "@/lib/lab-meta";

/*
 * MDX compilation only. Importing the demo barrel makes every page that touches
 * this module a client entry point for all sixteen demos, so only the
 * experiment page — the one route that actually renders one — may import it.
 * Everything that just needs titles and descriptions lives in `lib/lab-meta`.
 */

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
