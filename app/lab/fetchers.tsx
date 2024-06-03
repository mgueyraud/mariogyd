import fs from "fs";
import { compileMDX } from "next-mdx-remote/rsc";
import path from "path";
import labComponents from "@/components/lab/LabComponents";

const contentDir = path.join(process.cwd(), "app/lab/_lab-content");

export async function getLabPostBySlug(slug: string){
    const fileName = slug + ".mdx";
    const filePath = path.join(contentDir, fileName);
    const fileContent = fs.readFileSync(filePath, "utf8");

    const { frontmatter, content } = await compileMDX<{title: string, author: string, publishedDate: string, video: string}>({
        source: fileContent, 
        options: { parseFrontmatter: true},
        components: {
            h1: (props) => <h2 {...props} className="font-semibold mb-2"/>,
            p: (props) => <p {...props} className="font-light mb-1"/>,
            a: (props) => <a {...props} className="font-light underline" target="_blank"/>,
            li: (props) => <li {...props} className="font-light list-disc"/>,
            ...labComponents
        }
    });

    return {
        frontmatter,
        content, 
        slug: path.parse(fileName).name
    }
}

export async function getLabPosts(){
    const files = fs.readdirSync(contentDir);
    const posts = await Promise.all( files.map(async (file) => await getLabPostBySlug(path.parse(file).name)))

    return posts;
}