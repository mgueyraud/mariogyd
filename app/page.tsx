import ToggleThemButton from "@/components/custom/ToggleThemButton";

export default function Home() {
  return (
    <main className="py-20 max-w-xl mx-auto px-4 md:px-0">
      <ToggleThemButton />

      <h1 className="font-semibold">Mario Gueyraud</h1>
      <h2 className="font-light mt-1 dark:text-gray-300">Senior Front-End & Design Engineer</h2>
      <p className="mt-7 font-light dark:text-gray-300">
        I love building digital experiences that people love and find delightful. With a keen eye for great taste and a commitment to simplicity and modernist design, I strive to create interfaces that are not only beautiful but also functional and intuitive.
      </p>

      <h2 className="font-semibold mt-16">Experience</h2>
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex">
          <div className="flex-1">
            <p className="font-light dark:text-gray-300">2024</p>
          </div>
          <div className="flex-1">
            <p>Full Stack Engineer at <a className="underline" target="_blank" href="https://saagas.ai/">Saagas.ai</a></p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-light dark:text-gray-300">2023</p>
          </div>
          <div className="flex-1">
            <p>Senior Front-End Engineer at <a className="underline" target="_blank" href="https://tinloof.com/">Tinloof</a></p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-light dark:text-gray-300">2023</p>
          </div>
          <div className="flex-1">
            <p>Front-End Engineer at <a className="underline" target="_blank" href="https://belk.com/">Belk</a></p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-light dark:text-gray-300">2022</p>
          </div>
          <div className="flex-1">
            <p>Lead Front-End Engineer at <a className="underline" target="_blank" href="https://tonic3.com/">Tonic 3</a></p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-light dark:text-gray-300">2021</p>
          </div>
          <div className="flex-1">
            <p>React.js & UI Developer at <a className="underline" target="_blank" href="http://teixido.co/">Teixido</a></p>
          </div>
        </div>
        <div className="flex">
          <div className="flex-1">
            <p className="font-light dark:text-gray-300">2020</p>
          </div>
          <div className="flex-1">
            <p>Sofware Engineer Intern at <a className="underline" target="_blank" href="http://teixido.co/">Teixido</a></p>
          </div>
        </div>
      </div>

      <h2 className="font-semibold mt-16">Get in touch</h2>
      <div className="flex gap-2 mt-4 font-light dark:text-gray-300">
        <a href="https://github.com/mgueyraud" target="_blank">Github</a>
        <a href="https://twitter.com/mariogyd" target="_blank">Twitter</a>
        <a href="https://www.linkedin.com/in/mariogyd/" target="_blank">Linkedin</a>
        <a href="mailto:mgueyraud.junior@gmail.com" >Mail</a>
      </div>
    </main>
  );
}
