"use client";

import PhotoAlbum from "react-photo-album";
import { getEventImages, getEventsMetadata } from "@/app/lib/lib";
import type { photoData } from "@/app/lib/lib";
import { useState, useEffect } from "react";

export default function Events() {
  const [images, setImages] = useState<photoData[]>([]);

  useEffect(() => {
    getEventsMetadata().then((data) => {
      Promise.all(
        Object.entries(data).map(([folderPath, event]) =>
          getEventImages(folderPath, event)
        )
      ).then((imagePromises) => {
        setImages(imagePromises.reduce((acc, cur) => acc.concat(cur), []));
      });
    });
  }, []);

  return (
    <main className="p-12">
      {images.length === 0 ? (
        <h1 className="min-h-screen flex justify-center items-center">
          Loading
        </h1>
      ) : (
        <PhotoAlbum
          layout="masonry"
          photos={images}
          renderPhoto={({ photo, wrapperStyle, renderDefaultPhoto }) => (
            <a
              className="group relative"
              href={photo.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              <div
                style={wrapperStyle}
                className="filter brightness-100 blur-0 group-hover:blur-md group-hover:brightness-50 transition-all"
              >
                {renderDefaultPhoto({ wrapped: true })}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
                <p className="text-white text-center">{photo.date}</p>
                <p className="text-white text-center">{photo.name}</p>
              </div>
            </a>
          )}
        />
      )}
    </main>
  );
}
