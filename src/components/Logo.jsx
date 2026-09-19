import React from 'react';

export default function Logo({ className = "w-8 h-8", sunflower = false }) {
  if (sunflower) {
    // Generate the complex sunflower SVG programmatically for the hero
    const petalsLayer1 = [];
    for (let i = 0; i < 26; i++) {
      const a = (360 / 26) * i + 6.9;
      petalsLayer1.push(
        <g key={`p1-${i}`} transform={`rotate(${a.toFixed(2)}) scale(0.96)`}>
          <path style={{ animationDelay: `${i * 18 + 200}ms` }} className="animate-bloom origin-center opacity-0" d="M0,-44 C15,-68 13,-104 0,-126 C-13,-104 -15,-68 0,-44Z" fill="#E59A00" stroke="#B87200" strokeWidth="1.2" />
        </g>
      );
    }
    const petalsLayer2 = [];
    for (let i = 0; i < 26; i++) {
      const a = (360 / 26) * i;
      petalsLayer2.push(
        <g key={`p2-${i}`} transform={`rotate(${a.toFixed(2)}) scale(1)`}>
          <path style={{ animationDelay: `${(26 + i) * 18 + 200}ms` }} className="animate-bloom origin-center opacity-0" d="M0,-44 C15,-68 13,-104 0,-126 C-13,-104 -15,-68 0,-44Z" fill="#FFC61A" stroke="#D99A00" strokeWidth="1.2" />
        </g>
      );
    }

    const g = 137.508 * Math.PI / 180;
    const step = 2.95;
    const seeds = [];
    for (let n = 1; n <= 230; n++) {
      const r = step * Math.sqrt(n);
      const t = n * g;
      const col = n % 7 === 0 ? '#8A5A24' : (n % 3 === 0 ? '#5B3714' : '#6B4419');
      seeds.push(
        <circle key={`s-${n}`} cx={(r * Math.cos(t)).toFixed(1)} cy={(r * Math.sin(t)).toFixed(1)} r={(1.2 + n / 420).toFixed(2)} fill={col} />
      );
    }

    return (
      <svg viewBox="-130 -130 260 260" className={className} aria-hidden="true">
        <g className="animate-spin-slow origin-center">
          {petalsLayer1}
          {petalsLayer2}
          <circle r="47" fill="#3A210C" />
          <circle r="47" fill="none" stroke="#6B4419" strokeWidth="3" />
          {seeds}
        </g>
      </svg>
    );
  }

  // Mini logo
  const miniPetals = [];
  for (let k = 0; k < 12; k++) {
    miniPetals.push(
      <path key={`mp-${k}`} transform={`rotate(${k * 30})`} d="M0,-40 C16,-68 14,-104 0,-126 C-14,-104 -16,-68 0,-40Z" fill={k % 2 ? '#E59A00' : '#FFC61A'} />
    );
  }

  return (
    <svg viewBox="-130 -130 260 260" className={className} aria-hidden="true">
      {miniPetals}
      <circle r="46" fill="#3A210C" />
    </svg>
  );
}
