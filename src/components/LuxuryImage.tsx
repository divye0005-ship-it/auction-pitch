import React, { useState } from 'react';

interface LuxuryImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function LuxuryImage({ src, alt, className = '' }: LuxuryImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-[#050b14] border border-[#d4af37]/30 ${className}`}>
        <div className="text-center p-4">
          <h3 className="text-[#d4af37] font-display font-black uppercase tracking-widest text-lg md:text-xl drop-shadow-md">
            {alt}
          </h3>
          <p className="text-[10px] text-[#8b7322] font-black uppercase tracking-[0.2em] mt-2">
            Image Unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
