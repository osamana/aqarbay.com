'use client';

import { useEffect, useState } from 'react';
import { getImageUrl } from '@/lib/utils';

interface PropertyGalleryBackgroundProps {
  images: string[];
}

export default function PropertyGalleryBackground({ images }: PropertyGalleryBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || images.length === 0) {
    return null;
  }

  // Create enough duplicates for seamless infinite loop (each row needs enough to fill 2-3 screen widths)
  // For seamless loop: duplicate images 4-5 times per row to ensure no gaps
  const createRowImages = (baseImages: string[], duplicates: number = 5) => {
    const row: string[] = [];
    for (let i = 0; i < duplicates; i++) {
      row.push(...baseImages);
    }
    return row;
  };

  // Distribute images across rows (shuffle/rotate for variety)
  const row1Images = createRowImages(images, 5);
  const row2Images = createRowImages([...images.slice(1), images[0]], 5); // Rotate
  const row3Images = createRowImages([...images.slice(2), ...images.slice(0, 2)], 5); // Rotate more
  const row4Images = createRowImages([...images.slice(3), ...images.slice(0, 3)], 5); // Rotate even more

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Multi-row Gallery Container */}
      <div className="gallery-multi-row-container">
        {/* Row 1 - Scrolls left */}
        <div className="gallery-row">
          <div className="gallery-scroll-track scroll-left-1">
            {row1Images.map((image, index) => (
              <div key={`row1-${index}`} className="gallery-image-wrapper">
                <img
                  src={getImageUrl(image)}
                  alt=""
                  className="gallery-image"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Scrolls right (reverse) */}
        <div className="gallery-row">
          <div className="gallery-scroll-track scroll-right-1">
            {row2Images.map((image, index) => (
              <div key={`row2-${index}`} className="gallery-image-wrapper">
                <img
                  src={getImageUrl(image)}
                  alt=""
                  className="gallery-image"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 - Scrolls left (slower) */}
        <div className="gallery-row">
          <div className="gallery-scroll-track scroll-left-2">
            {row3Images.map((image, index) => (
              <div key={`row3-${index}`} className="gallery-image-wrapper">
                <img
                  src={getImageUrl(image)}
                  alt=""
                  className="gallery-image"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 4 - Scrolls right (slower) */}
        <div className="gallery-row">
          <div className="gallery-scroll-track scroll-right-2">
            {row4Images.map((image, index) => (
              <div key={`row4-${index}`} className="gallery-image-wrapper">
                <img
                  src={getImageUrl(image)}
                  alt=""
                  className="gallery-image"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px]"></div>

      <style jsx>{`
        .gallery-multi-row-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px 0;
        }

        .gallery-row {
          flex: 1;
          width: 100%;
          overflow: hidden;
          display: flex;
          align-items: center;
          min-height: 0;
        }

        .gallery-scroll-track {
          display: flex;
          gap: 16px;
          will-change: transform;
          white-space: nowrap;
          height: 100%;
          align-items: center;
        }

        .scroll-left-1 {
          animation: scrollLeft1 100s linear infinite;
        }

        .scroll-right-1 {
          animation: scrollRight1 110s linear infinite;
        }

        .scroll-left-2 {
          animation: scrollLeft2 120s linear infinite;
        }

        .scroll-right-2 {
          animation: scrollRight2 130s linear infinite;
        }

        .gallery-image-wrapper {
          flex-shrink: 0;
          width: 280px;
          height: 200px;
          overflow: hidden;
          border-radius: 8px;
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.35;
        }

        @media (max-width: 1024px) {
          .gallery-image-wrapper {
            width: 240px;
            height: 170px;
          }
          
          .gallery-multi-row-container {
            gap: 12px;
            padding: 12px 0;
          }
          
          .gallery-scroll-track {
            gap: 12px;
          }
        }

        @media (max-width: 768px) {
          .gallery-image-wrapper {
            width: 200px;
            height: 140px;
          }
          
          .gallery-multi-row-container {
            gap: 10px;
            padding: 10px 0;
          }
          
          .gallery-scroll-track {
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .gallery-image-wrapper {
            width: 160px;
            height: 120px;
          }
          
          .gallery-multi-row-container {
            gap: 8px;
            padding: 8px 0;
          }
          
          .gallery-scroll-track {
            gap: 8px;
          }
        }

        @keyframes scrollLeft1 {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-20%);
          }
        }

        @keyframes scrollRight1 {
          0% {
            transform: translateX(-20%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes scrollLeft2 {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-20%);
          }
        }

        @keyframes scrollRight2 {
          0% {
            transform: translateX(-20%);
          }
          100% {
            transform: translateX(0);
          }
        }

        /* Pause animation on hover */
        .gallery-multi-row-container:hover .gallery-scroll-track {
          animation-play-state: paused;
        }

        @media (max-width: 768px) {
          .scroll-left-1 {
            animation-duration: 80s;
          }

          .scroll-right-1 {
            animation-duration: 90s;
          }

          .scroll-left-2 {
            animation-duration: 100s;
          }

          .scroll-right-2 {
            animation-duration: 110s;
          }
        }
      `}</style>
    </div>
  );
}

