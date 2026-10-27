export type Testimonial = {
  /** Stable key for React and element ids. */
  key: string;
  name: string;
  initials: string;
  linkedin: string;
  /** Where they are now, if different from where you overlapped. */
  now?: string;
  /** "Worked together at X · relationship" */
  together: string;
  /** The one-sentence pull quote shown up front. */
  highlight: string;
  /** The full recommendation, one entry per paragraph. */
  paras: string[];
  /**
   * Public path to a square headshot. Leave it out and the card renders a
   * gradient in its place.
   */
  photo?: string;
};

export const KIND_WORDS: Testimonial[] = [
  {
    key: "pedro",
    name: "Pedro Tabio",
    initials: "PT",
    linkedin:
      "https://www.linkedin.com/in/pedrotabio/",
    now: "Now at Cognition",
    together: "Worked together at Ultralight · managed Mario",
    highlight:
      "He picked up new concepts fast and worked independently — someone I could trust to take a task and run with it.",
    paras: [
      "I managed Mario at Ultralight and really valued his ability to learn quickly and get things shipped. He picked up new concepts fast and worked independently, with very little guidance needed from me. He was consistently productive and someone I could trust to take a task and run with it. I’d happily work with him again.",
    ],
    photo: "/images/kind-words/pedro-tabio.jpg",
  },
  {
    key: "nicolas",
    name: "Nicolás Gonzalvez",
    initials: "NG",
    linkedin:
      "https://www.linkedin.com/in/ngonzalvez/",
    together: "Worked together at Ultralight · founding engineers",
    highlight:
      "He built the room-scheduling system and owned it end-to-end, which helped unlock the next funding round.",
    paras: [
      "I worked alongside Mario for a year at Ultralight (formerly Vibrant Practice), both of us as Founding Engineers.",
      "He built the room-scheduling system for patient appointments involving medical equipment. He owned it end-to-end, which helped unlock the next funding round. He also contributed to improving the accuracy of the AI agents that process medical documents like lab results and clinical reports.",
      "Mario was already a strong engineer when we started working together, and still showed clear growth over that year. He’s a great coworker and an even better person.",
      "I recommend him without hesitation if your startup needs a helping hand with engineering.",
    ],
    photo: "/images/kind-words/nicolas-gonzalvez.jpg",
  },
  {
    key: "edwin",
    name: "Edwin Villacis",
    initials: "EV",
    linkedin:
      "https://www.linkedin.com/in/edwin-villacis-a83879231/",
    together: "Worked together at Saagas · same team",
    highlight:
      "A key contributor with strong frontend skills — he turned ideas into functional, well crafted products.",
    paras: [
      "Mario was a key contributor to our work at Saagas, consistently bringing strong frontend skills and a thoughtful approach to solving problems. I appreciated his ability to turn ideas into functional, well crafted products and his willingness to tackle challenges in a fast paced startup environment. He’s someone I’d be happy to work with again and recommend to any engineering team.",
    ],
  },
];
