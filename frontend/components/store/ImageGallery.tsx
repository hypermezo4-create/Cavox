"use client";

import { useState } from "react";

export default function ImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(images[0]);

  return (
    <div className="space-y-3">
      <img src={active} alt="Product" className="h-80 w-full rounded-xl object-cover" />
      <div className="flex gap-2">
        {images.map((img) => (
          <button key={img} onClick={() => setActive(img)} className="rounded border border-[var(--border-color)]">
            <img src={img} alt="thumb" className="h-16 w-16 object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
