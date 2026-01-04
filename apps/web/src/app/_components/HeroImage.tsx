'use client';

import Image from 'next/image';
import { useState } from 'react';

const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGO49+7Jt/+f61tL8ivSGeQ0NCLTkgsq82cuns7AzcygryeVVhiXnh4OAHsJD/ki5q1xAAAAAElFTkSuQmCC';

const PRIMARY_IMAGE_URL = '/images/hero-cooking.jpg';
const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=2070&q=80';

export default function HeroImage() {
  const [imgSrc, setImgSrc] = useState(PRIMARY_IMAGE_URL);

  const handleError = () => {
    // Guard against infinite loop if fallback also fails
    if (imgSrc !== FALLBACK_IMAGE_URL) {
      setImgSrc(FALLBACK_IMAGE_URL);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt="Fresh ingredients for home cooking in an Irish kitchen"
      fill
      sizes="100vw"
      className="object-cover opacity-70"
      priority
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onError={handleError}
    />
  );
}
