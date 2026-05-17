import React from 'react';

const brands = [
  "NIKE",
  "ADIDAS",
  "I-RUN",
  "PUMA",
  "REEBOK",
  "UNDER ARMOUR",
  "NEW BALANCE",
  "ASICS",
  "FILA",
];

const BrandMarquee = () => {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white py-6 overflow-hidden flex whitespace-nowrap relative border-t border-b border-gray-800 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-0 left-1/4 w-32 h-full bg-brand-red/10 blur-2xl rounded-full"></div>
      <div className="absolute top-0 right-1/4 w-32 h-full bg-blue-500/10 blur-2xl rounded-full"></div>

      <div className="animate-marquee flex w-max items-center relative z-10">
        {/* Render the brands twice to create an infinite loop effect */}
        {[...brands, ...brands].map((brand, index) => (
          <div
            key={index}
            style={{ animationDelay: `${index * 0.2}s` }}
            className="animate-float flex-shrink-0 px-6 sm:px-8 mx-3 sm:mx-6 text-xl sm:text-2xl md:text-4xl font-black tracking-widest text-gray-500 hover:text-white hover:scale-110 transition-all duration-300 font-montserrat hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] cursor-default"
          >
            {brand}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandMarquee;
