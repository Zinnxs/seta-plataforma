import React from 'react';

/**
 * SetaSymbol: Símbolo Monoline Minimalista do Seminário Teológico Aliança (SETA)
 * Fusão geométrica de 3 elementos centrais:
 * 1. Páginas abertas das Sagradas Escrituras (ensino e teologia)
 * 2. Círculo/Arco da Aliança (unidade e fidelidade de Deus)
 * 3. Haste e Ponta Ascendente (a "SETA", vocação e transcendência espiritual)
 */
export function SetaSymbol({ 
  className = "w-6 h-6", 
  size, 
  strokeWidth = 1.5,
  ...props 
}) {
  const dimensionStyle = size ? { width: size, height: size } : undefined;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 48 48" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth}
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
      style={dimensionStyle}
      aria-label="Símbolo Oficial SETA"
      role="img"
      {...props}
    >
      {/* Círculo da Aliança (Selo / Covenant Ring) */}
      <circle cx="24" cy="24" r="21.5" opacity="0.4" />

      {/* As Páginas das Escrituras (Livro Aberto) */}
      {/* Folha Esquerda */}
      <path d="M 24 25 C 19 23 14 24 9 22 L 9 30.5 C 14 32.5 19 31.5 24 33.5 Z" />
      {/* Linha interna de leitura da folha esquerda */}
      <path d="M 11.5 27 C 15 28.5 19.5 28 24 29.5" opacity="0.65" />

      {/* Folha Direita */}
      <path d="M 24 25 C 29 23 34 24 39 22 L 39 30.5 C 34 32.5 29 31.5 24 33.5 Z" />
      {/* Linha interna de leitura da folha direita */}
      <path d="M 36.5 27 C 33 28.5 28.5 28 24 29.5" opacity="0.65" />

      {/* Lombada / Eixo Central */}
      <line x1="24" y1="25" x2="24" y2="34.5" />

      {/* A Seta Ascendente / Facho de Direção Espiritual e Acadêmica */}
      <line x1="24" y1="22" x2="24" y2="8" />
      <path d="M 19.5 13 L 24 7.5 L 28.5 13" />

      {/* Arco da Aliança Superior (Elipse sutil de união entre as páginas e a seta) */}
      <path d="M 15 17.5 C 19 14.5 29 14.5 33 17.5" opacity="0.75" />
    </svg>
  );
}

/**
 * SetaLogo: Lockup completo (Símbolo + Tipografia Nobre)
 */
export function SetaLogo({ 
  orientation = 'horizontal', 
  className = '',
  showSubtitle = true 
}) {
  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="p-3 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-[#FAF9F5] dark:bg-[#1B1C22] text-[#9E6C1B] dark:text-[#E0A94E] mb-3">
          <SetaSymbol size={48} strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-2xl font-semibold tracking-wider text-[#1D1B18] dark:text-[#EDEDE8]">
          PORTAL <span className="text-[#9E6C1B] dark:text-[#E0A94E]">SETA</span>
        </h2>
        {showSubtitle && (
          <p className="mt-1 text-[10px] font-sans font-semibold tracking-[0.25em] text-[#6E6A63] dark:text-[#9E9C96] uppercase">
            Seminário Teológico Aliança
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="p-2 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-[#FAF9F5] dark:bg-[#1B1C22] text-[#9E6C1B] dark:text-[#E0A94E] shrink-0">
        <SetaSymbol size={28} strokeWidth={1.6} />
      </div>
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-serif text-[16px] font-semibold tracking-wider text-[#1D1B18] dark:text-[#EDEDE8]">
            PORTAL <span className="text-[#9E6C1B] dark:text-[#E0A94E]">SETA</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="block text-[10px] font-medium tracking-wide text-[#6E6A63] dark:text-[#9E9C96] uppercase">
            Seminário Teológico Aliança
          </span>
        )}
      </div>
    </div>
  );
}
