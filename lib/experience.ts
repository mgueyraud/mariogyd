export type Role = {
  years: string;
  company: string;
  role: string;
  desc: string;
  site: string;
  url: string;
};

// Real experience. Descriptions condensed from the resume; URLs are the live sites.
export const ROLES: Role[] = [
  {
    years: "2025 ··· 2026",
    company: "Vibrant",
    role: "Senior Fullstack Engineer",
    desc: "Scheduling, real-time AI scribing, and clinical records for a healthcare platform. Grew from 6 to 65 practices in a year, through a $9M raise.",
    site: "vibrantpractice.com",
    url: "https://vibrantpractice.com",
  },
  {
    years: "2024",
    company: "Binti",
    role: "Senior Frontend Engineer",
    desc: "React work behind an eight-figure state contract, including the intake screening tool and profile pages.",
    site: "binti.com",
    url: "https://binti.com",
  },
  {
    years: "2024",
    company: "Saagas.ai",
    role: "Full Stack Engineer",
    desc: "Built the MVP app and landing page in Next.js and React, with Python and FastAPI lambdas behind them.",
    site: "saagas.ai",
    url: "https://saagas.ai",
  },
  {
    years: "2023",
    company: "Tinloof",
    role: "Senior Front-End Engineer",
    desc: "Led SoleRetriever's blog MVP on Next.js and Sanity, and moved their Webflow content across with custom scrapers.",
    site: "tinloof.com",
    url: "https://tinloof.com",
  },
  {
    years: "2023",
    company: "Belk",
    role: "Front-End Engineer",
    desc: "Front end of belk.com for millions of shoppers. Cut server-side render time by close to half.",
    site: "belk.com",
    url: "https://www.belk.com",
  },
  {
    years: "2022",
    company: "Tonic 3",
    role: "Lead Front-End Engineer",
    desc: "Built Avery Dennison's dashboard in React and TypeScript, with charts, Mapbox maps, and filterable tables.",
    site: "tonic3.com",
    url: "https://www.tonic3.com",
  },
  {
    years: "2021",
    company: "Teixido",
    role: "React.js & UI Developer",
    desc: "Maintained a newspaper's design system in SASS, and cut load time with lazy-loaded React components.",
    site: "teixido.co",
    url: "https://teixido.co",
  },
  {
    years: "2020",
    company: "Teixido",
    role: "Software Engineer Intern",
    desc: "Started as an intern and was shipping production UI within the first month.",
    site: "teixido.co",
    url: "https://teixido.co",
  },
];
