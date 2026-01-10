'use client';

import Image from 'next/image';
import { useState } from 'react';

const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGO49+7Jt/+f61tL8ivSGeQ0NCLTkgsq82cuns7AzcygryeVVhiXnh0OAHsJD/ki5q1xAAAAAElFTkSuQmCC';

const PRIMARY_IMAGE_URL =
  'https://hel1.your-objectstorage.com/recipe-store/warm-cozy-irish-family-kitchen-m-1768001948017-b0a9f8de-ff8f-45a1-abf3-8f017ba7d237.png';
const FALLBACK_IMAGE_URL = '/images/hero-cooking.jpg';

export function HeroImage() {
  const [imgSrc, setImgSrc] = useState(PRIMARY_IMAGE_URL);

  const handleError = () => {
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

export default HeroImage;
