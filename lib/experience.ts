export type Role = {
  years: string;
  company: string;
  role: string;
  current?: boolean;
  desc: string;
  site: string;
  url: string;
};

// Real experience. Descriptions authored for the redesign; URLs are the live sites.
export const ROLES: Role[] = [
  {
    years: "2025 ··· NOW",
    company: "Vibrant",
    role: "Senior Fullstack Engineer",
    current: true,
    desc: "Leading front-end architecture for a healthcare platform — the design system, performance budgets, and the interaction details in between.",
    site: "vibrantpractice.com",
    url: "https://vibrantpractice.com",
  },
  {
    years: "2024",
    company: "Binti",
    role: "Senior Frontend Engineer",
    desc: "Built adoption and foster-care workflows in React; shipped accessibility fixes across the whole intake flow.",
    site: "binti.com",
    url: "https://binti.com",
  },
  {
    years: "2024",
    company: "Saagas.ai",
    role: "Full Stack Engineer",
    desc: "Full-stack product work on an early AI storytelling tool — from the Postgres schema to the final polish.",
    site: "saagas.ai",
    url: "https://saagas.ai",
  },
  {
    years: "2023",
    company: "Tinloof",
    role: "Senior Front-End Engineer",
    desc: "Marketing sites and e-commerce for clients on Next.js and Sanity, with a focus on Core Web Vitals.",
    site: "tinloof.com",
    url: "https://tinloof.com",
  },
  {
    years: "2023",
    company: "Belk",
    role: "Front-End Engineer",
    desc: "Front-end on the product listing and checkout experience for a large retail platform.",
    site: "belk.com",
    url: "https://www.belk.com",
  },
  {
    years: "2022",
    company: "Tonic 3",
    role: "Lead Front-End Engineer",
    desc: "Led a small front-end team building white-label banking UI; owned the shared component library.",
    site: "tonic3.com",
    url: "https://www.tonic3.com",
  },
  {
    years: "2021",
    company: "Teixido",
    role: "React.js & UI Developer",
    desc: "React and UI development across client projects; motion and micro-interactions.",
    site: "teixido.co",
    url: "https://teixido.co",
  },
  {
    years: "2020",
    company: "Teixido",
    role: "Software Engineer Intern",
    desc: "Started as an intern shipping production UI within the first month.",
    site: "teixido.co",
    url: "https://teixido.co",
  },
];
