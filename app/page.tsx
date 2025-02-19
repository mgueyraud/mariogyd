import Link from "next/link";
import { CSSProperties } from "react";
import { LuNewspaper } from "react-icons/lu";

export default function Home() {
  return (
    <>
      <h1
        className="font-semibold animate-enter"
        style={{ "--stagger": 1 } as CSSProperties}
      >
        Mario Gueyraud
      </h1>
      <h2
        className="font-light mt-1 text-gray-300 animate-enter"
        style={{ "--stagger": 2 } as CSSProperties}
      >
        Senior Front-End & Design Engineer
      </h2>
      <p
        className="mt-7 font-light text-gray-300 animate-enter"
        style={{ "--stagger": 3 } as CSSProperties}
      >
        I love building digital experiences that people love and find
        delightful. With a keen eye for great taste and a commitment to
        simplicity and modernist design, I strive to create interfaces that are
        not only beautiful but also functional and intuitive.
      </p>

      <h2
        className="font-semibold mt-16 animate-enter"
        style={{ "--stagger": 4 } as CSSProperties}
      >
        Experience
      </h2>
      <div
        className="mt-8 flex flex-col gap-6 animate-enter"
        style={{ "--stagger": 5 } as CSSProperties}
      >
        <div className="flex">
          <div className="flex-1">
            <p className="font-light text-gray-300">2024</p>
          </div>
          <div className="flex-1">
            <p>
              Senior Frontend Engineer at{" "}
              <a
                className="underline"
                target="_blank"
                href="https://binti.com/"
              >
                Binti
              </a>
            </p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-light text-gray-300">2024</p>
          </div>
          <div className="flex-1">
            <p>
              Full Stack Engineer at{" "}
              <a
                className="underline"
                target="_blank"
                href="https://saagas.ai/"
              >
                Saagas.ai
              </a>
            </p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-light text-gray-300">2023</p>
          </div>
          <div className="flex-1">
            <p>
              Senior Front-End Engineer at{" "}
              <a
                className="underline"
                target="_blank"
                href="https://tinloof.com/"
              >
                Tinloof
              </a>
            </p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-light text-gray-300">2023</p>
          </div>
          <div className="flex-1">
            <p>
              Front-End Engineer at{" "}
              <a className="underline" target="_blank" href="https://belk.com/">
                Belk
              </a>
            </p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-light text-gray-300">2022</p>
          </div>
          <div className="flex-1">
            <p>
              Lead Front-End Engineer at{" "}
              <a
                className="underline"
                target="_blank"
                href="https://tonic3.com/"
              >
                Tonic 3
              </a>
            </p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-light text-gray-300">2021</p>
          </div>
          <div className="flex-1">
            <p>
              React.js & UI Developer at{" "}
              <a
                className="underline"
                target="_blank"
                href="http://teixido.co/"
              >
                Teixido
              </a>
            </p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-light text-gray-300">2020</p>
          </div>
          <div className="flex-1">
            <p>
              Sofware Engineer Intern at{" "}
              <a
                className="underline"
                target="_blank"
                href="http://teixido.co/"
              >
                Teixido
              </a>
            </p>
          </div>
        </div>
        <Link
          href="https://read.cv/mariogyd"
          className="w-fit p-2 rounded-md bg-white text-black flex gap-1 items-center mt-1"
        >
          <LuNewspaper />
          <span className="text-xs">View Resume</span>
        </Link>
      </div>

      <h2
        className="font-semibold mt-16 animate-enter"
        style={{ "--stagger": 6 } as CSSProperties}
      >
        Lab
      </h2>
      <p
        className="font-light mt-2 text-gray-300 animate-enter"
        style={{ "--stagger": 7 } as CSSProperties}
      >
        In my proccess of learning design engineering and crafting animations,
        I&apos;ve built this section to have a curated list of designs to
        showcase my skills, as well as learning them. I share my journey as a
        design engineer{" "}
        <Link prefetch href="/lab" className="underline">
          here
        </Link>
        .
      </p>

      <h2
        className="font-semibold mt-16 animate-enter"
        style={{ "--stagger": 8 } as CSSProperties}
      >
        Get in touch
      </h2>
      <div
        className="flex gap-2 mt-4 font-light text-gray-300 animate-enter"
        style={{ "--stagger": 8 } as CSSProperties}
      >
        <a href="https://github.com/mgueyraud" target="_blank">
          Github
        </a>
        <a href="https://twitter.com/mariogyd" target="_blank">
          Twitter
        </a>
        <a href="https://www.linkedin.com/in/mariogyd/" target="_blank">
          Linkedin
        </a>
        <a href="mailto:mgueyraud.junior@gmail.com">Mail</a>
      </div>
    </>
  );
}
