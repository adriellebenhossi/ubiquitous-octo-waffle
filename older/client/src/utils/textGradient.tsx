

// Gradientes disponíveis para badges (texto entre parênteses)
export const BADGE_GRADIENTS = {
  // Feminino & Delicado
  'pink-purple': 'from-pink-500 to-purple-600',
  'rose-pink': 'from-rose-500 to-pink-600',
  'fuchsia-pink': 'from-fuchsia-500 to-pink-600',
  'violet-purple': 'from-violet-500 to-purple-600',
  'lavender-pink': 'from-purple-300 to-pink-400',
  'coral-rose': 'from-pink-400 to-rose-500',
  'magenta-purple': 'from-purple-500 to-fuchsia-500',
  
  // Profissional & Confiança
  'blue-purple': 'from-blue-500 to-purple-600',
  'indigo-purple': 'from-indigo-500 to-purple-600',
  'sky-blue': 'from-sky-500 to-blue-600',
  'cyan-blue': 'from-cyan-500 to-blue-600',
  'slate-blue': 'from-slate-500 to-blue-600',
  'navy-indigo': 'from-blue-800 to-indigo-600',
  'steel-cyan': 'from-gray-500 to-cyan-500',
  
  // Natureza & Bem-estar
  'green-blue': 'from-green-500 to-blue-600',
  'emerald-teal': 'from-emerald-500 to-teal-600',
  'teal-cyan': 'from-teal-500 to-cyan-600',
  'lime-green': 'from-lime-500 to-green-600',
  'forest-emerald': 'from-green-700 to-emerald-500',
  'mint-teal': 'from-green-300 to-teal-400',
  'sage-green': 'from-green-400 to-emerald-600',
  
  // Energia & Vitalidade
  'orange-red': 'from-orange-500 to-red-600',
  'amber-orange': 'from-amber-500 to-orange-600',
  'yellow-orange': 'from-yellow-500 to-orange-600',
  'sunset-red': 'from-orange-400 to-red-500',
  'gold-amber': 'from-yellow-400 to-amber-500',
  'fire-orange': 'from-red-500 to-orange-400',
  
  // Luxo & Sofisticação
  'gold-bronze': 'from-amber-300 to-amber-600',
  'silver-gray': 'from-gray-300 to-gray-600',
  'rose-gold': 'from-pink-300 to-amber-400',
  'platinum-silver': 'from-gray-200 to-slate-500',
  'copper-bronze': 'from-orange-300 to-amber-700',
  'champagne-gold': 'from-yellow-200 to-amber-500',
  
  // Moderno & Tecnológico
  'electric-blue': 'from-blue-400 to-cyan-300',
  'neon-purple': 'from-purple-400 to-pink-300',
  'digital-green': 'from-green-400 to-cyan-300',
  'holographic': 'from-purple-400 to-blue-400 via-pink-400',
  'cyber-pink': 'from-pink-400 to-purple-300',
  'matrix-green': 'from-lime-400 to-green-500',
  
  // Calmo & Sereno
  'powder-blue': 'from-blue-200 to-cyan-300',
  'soft-lavender': 'from-purple-200 to-pink-200',
  'gentle-mint': 'from-green-200 to-teal-200',
  'cream-beige': 'from-amber-100 to-orange-200',
  'pearl-white': 'from-gray-100 to-blue-100',
  'whisper-gray': 'from-gray-200 to-slate-300'
};

export function processTextWithGradient(text: string, gradientKey?: string): JSX.Element {
  if (!text) return <span>{text}</span>;

  const gradient = gradientKey ? BADGE_GRADIENTS[gradientKey as keyof typeof BADGE_GRADIENTS] : 'from-pink-500 to-purple-600';

  // Regex para encontrar texto entre parênteses
  const regex = /\(([^)]+)\)/g;
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        // Se o índice é ímpar, é o conteúdo dentro dos parênteses
        if (index % 2 === 1) {
          return (
            <span
              key={index}
              className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold`}
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

// Função específica para badges de seção (pequenos títulos acima)
export function processBadgeWithGradient(text: string, gradientKey?: string): string {
  const gradient = gradientKey ? BADGE_GRADIENTS[gradientKey as keyof typeof BADGE_GRADIENTS] : 'from-pink-500 to-purple-600';
  return `bg-gradient-to-r ${gradient} text-transparent bg-clip-text font-bold`;
}

// Mapeamento de cores Tailwind para valores hex
const TAILWIND_COLORS: { [key: string]: string } = {
  'pink-500': '#ec4899',
  'purple-600': '#9333ea',
  'blue-500': '#3b82f6',
  'green-500': '#22c55e',
  'orange-500': '#f97316',
  'red-600': '#dc2626',
  'teal-500': '#14b8a6',
  'cyan-600': '#0891b2',
  'indigo-500': '#6366f1',
  'rose-500': '#f43f5e',
  'emerald-500': '#10b981',
  'violet-500': '#8b5cf6',
  'amber-500': '#f59e0b',
  'sky-500': '#0ea5e9',
  'lime-500': '#84cc16',
  'fuchsia-500': '#d946ef',
  'yellow-500': '#eab308'
};

// Função para extrair a primeira cor de um gradiente
export function getFirstColorFromGradient(gradientKey?: string): string {
  if (!gradientKey || !BADGE_GRADIENTS[gradientKey as keyof typeof BADGE_GRADIENTS]) {
    return '#ec4899'; // pink-500 como padrão
  }
  
  const gradient = BADGE_GRADIENTS[gradientKey as keyof typeof BADGE_GRADIENTS];
  const firstColorMatch = gradient.match(/from-(\w+-\d+)/);
  const firstColorName = firstColorMatch?.[1];
  
  return firstColorName ? TAILWIND_COLORS[firstColorName] || '#ec4899' : '#ec4899';
}

// Função para converter hex para rgba
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}