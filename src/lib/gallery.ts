import fs from "fs";
import path from "path";

const GALLERY_DIR = path.join(process.cwd(), "public", "gallery");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".heic"]);

export type GalleryImage = {
  src: string;
  mtime: number;
};

export function getGalleryImages(): GalleryImage[] {
  if (!fs.existsSync(GALLERY_DIR)) return [];

  return fs
    .readdirSync(GALLERY_DIR)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map((file) => {
      const stat = fs.statSync(path.join(GALLERY_DIR, file));
      return { src: `/gallery/${file}`, mtime: stat.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
}
