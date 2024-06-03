import Link from 'next/link'
import { getLabPosts } from './fetchers';
import LabVideo from '@/components/custom/LabVideo';

export default async function Lab() {

    const posts = await getLabPosts();

  return (
    <>
        <h1 className="font-semibold">Lab</h1>
        <p className="font-light mt-2 text-gray-300">
            A creative hub for UI experiments, component explorations, and interaction design. Discover innovative ideas and cutting-edge techniques that push the boundaries of digital experiences.
        </p>
        <div className='mt-6 grid grid-cols-1 gap-5 md:grid-cols-2'>
            {posts.map(post => (
                <Link key={post.slug} href={`lab/${post.slug}`} aria-label={post.frontmatter.title} className='block aspect-square focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-white'>
                    <LabVideo src={post.frontmatter.video} />
                </Link>
            ))}
        </div>
    </>
  )
}