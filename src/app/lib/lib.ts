"use server";

import fs from "fs";
import { promises as fs2 } from "fs";
import path from "path";
import sharp from "sharp";

type photoData = {
  src: string;
  width: number;
  height: number;
  href: string;
  date: string;
  name: string;
};

type Event = {
  name: string;
  date: string;
  event: string;
  blacklist: string[];
};

type Events = {
  [key: string]: Event;
};

const getEventImages = async (folderPath: string, event: Event) => {
  const imagesDir = path.join(
    process.cwd(),
    "public",
    "event_pictures",
    folderPath
  );

  const imageFiles = fs.readdirSync(imagesDir);

  const imageData = await Promise.all(
    imageFiles
      .filter((file) => !event.blacklist.includes(file))
      .map(async (file) => {
        const imagePath = path.join(imagesDir, file);
        const relativePath = path.relative(
          path.join(process.cwd(), "public"),
          imagePath
        );
        const metadata = await sharp(imagePath).metadata();
        return {
          src: relativePath,
          width: metadata.width ?? 0,
          height: metadata.height ?? 0,
          href: event.event,
          date: event.date,
          name: event.name,
        };
      })
  );

  return imageData;
};

const getEventsMetadata = async () => {
  const file = await fs2.readFile(
    path.join(process.cwd(), "public", "config.json"),
    "utf-8"
  );
  const data: Events = JSON.parse(file);

  return data;
};

export { getEventImages, getEventsMetadata };
export type { photoData, Event, Events };
