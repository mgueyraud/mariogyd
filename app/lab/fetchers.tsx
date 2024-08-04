import fs from "fs";
import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import labComponents from "@/components/lab/LabComponents";

const contentDir = path.join(process.cwd(), "app/lab/_lab-content");

export async function getLabPostBySlug(slug: string) {
  const fileName = slug + ".mdx";
  const filePath = path.join(contentDir, fileName);
  const fileContent = fs.readFileSync(filePath, "utf8");

  const { frontmatter, content } = await compileMDX<{
    title: string;
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

export async function getLabPosts(pageNum = 1) {
  const files = fs.readdirSync(contentDir);
  const posts = await Promise.all(
    files.map(async (file) => await getLabPostBySlug(path.parse(file).name))
  );

  const sortedPosts = posts.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedDate).getTime() -
      new Date(a.frontmatter.publishedDate).getTime()
  );

  const startPage = (pageNum - 1) * 4;

  const postsToShow = sortedPosts.slice(startPage, startPage + 4);

  return { posts: postsToShow, numOfPages: Math.ceil(sortedPosts.length / 4) };
}
