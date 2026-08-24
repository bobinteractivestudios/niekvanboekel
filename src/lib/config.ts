import fs from "fs";
import path from "path";

export type SiteConfig = {
  name: string;
  introLine: string;
  birthDate: string;
  deathDate: string;
  heroImage: string;
  officialText: string[];
};

const CONFIG_PATH = path.join(process.cwd(), "content", "site.json");

export function getSiteConfig(): SiteConfig {
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as SiteConfig;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
