import React from 'react';

export default function Logo({ className = "w-8 h-8", sunflower = false }) {
  // If they want the spinning effect for the hero sunflower
  if (sunflower) {
    return (
      <div className={`${className} animate-spin-slow overflow-hidden rounded-full border-[3px] border-[var(--sun-2)]`}>
         <img src="/logo.png" className="w-full h-full object-cover" alt="Krishi Setu Logo" />
      </div>
    );
  }

  // Regular logo for navbars
  return (
    <img src="/logo.png" className={`${className} object-contain rounded-full`} alt="Krishi Setu Logo" />
  );
}
