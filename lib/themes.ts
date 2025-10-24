export interface Theme {
  id: string;
  name: string;
  nameAr: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    gradient: string;
    // FIX: Add 'error' color property to the theme definition.
    error: string;
  };
  mode: 'light' | 'dark';
}
 
export const themes: Theme[] = [
  // Light Themes
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    nameAr: 'نسيم المحيط',
    colors: {
      primary: '#0ea5e9', // sky-500
      secondary: '#06b6d4', // cyan-500
      accent: '#14b8a6', // teal-500
      background: '#f0f9ff', // sky-50
      surface: '#ffffff',
      text: '#0c4a6e', // sky-900
      textSecondary: '#075985', // sky-800
      border: '#bae6fd', // sky-200
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
      error: '#ef4444', // red-500
    },
    mode: 'light'
  },
  {
    id: 'sunset',
    name: 'Desert Sunset',
    nameAr: 'غروب الصحراء',
    colors: {
      primary: '#f97316', // orange-500
      secondary: '#fb923c', // orange-400
      accent: '#fbbf24', // amber-400
      background: '#fff7ed', // orange-50
      surface: '#ffffff',
      text: '#7c2d12', // orange-900
      textSecondary: '#9a3412', // orange-800
      border: '#fed7aa', // orange-200
      gradient: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
      error: '#ef4444', // red-500
    },
    mode: 'light'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    nameAr: 'الغابة الخضراء',
    colors: {
      primary: '#10b981', // emerald-500
      secondary: '#34d399', // emerald-400
      accent: '#22c55e', // green-500
      background: '#ecfdf5', // emerald-50
      surface: '#ffffff',
      text: '#064e3b', // emerald-900
      textSecondary: '#065f46', // emerald-800
      border: '#a7f3d0', // emerald-200
      gradient: 'linear-gradient(135deg, #10b981 0%, #22c55e 100%)',
      error: '#ef4444', // red-500
    },
    mode: 'light'
  },
  {
    id: 'lavender',
    name: 'Lavender Dream',
    nameAr: 'حلم اللافندر',
    colors: {
      primary: '#a855f7', // purple-500
      secondary: '#c084fc', // purple-400
      accent: '#d946ef', // fuchsia-500
      background: '#faf5ff', // purple-50
      surface: '#ffffff',
      text: '#581c87', // purple-900
      textSecondary: '#6b21a8', // purple-800
      border: '#e9d5ff', // purple-200
      gradient: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
      error: '#ef4444', // red-500
    },
    mode: 'light'
  },
 
  // Dark Themes
  {
    id: 'midnight',
    name: 'Midnight Blue',
    nameAr: 'أزرق منتصف الليل',
    colors: {
      primary: '#3b82f6', // blue-500
      secondary: '#60a5fa', // blue-400
      accent: '#06b6d4', // cyan-500
      background: '#0f172a', // slate-900
      surface: '#1e293b', // slate-800
      text: '#f1f5f9', // slate-100
      textSecondary: '#cbd5e1', // slate-300
      border: '#334155', // slate-700
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
      error: '#f87171', // red-400
    },
    mode: 'dark'
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    nameAr: 'ليالي النيون',
    colors: {
      primary: '#ec4899', // pink-500
      secondary: '#f472b6', // pink-400
      accent: '#a855f7', // purple-500
      background: '#18181b', // zinc-900
      surface: '#27272a', // zinc-800
      text: '#fafafa', // zinc-50
      textSecondary: '#d4d4d8', // zinc-300
      border: '#3f3f46', // zinc-700
      gradient: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
      error: '#f87171', // red-400
    },
    mode: 'dark'
  },
  {
    id: 'emerald-dark',
    name: 'Emerald Night',
    nameAr: 'ليلة الزمرد',
    colors: {
      primary: '#10b981', // emerald-500
      secondary: '#34d399', // emerald-400
      accent: '#14b8a6', // teal-500
      background: '#0c1713', // custom dark green
      surface: '#1a2e23', // custom dark green
      text: '#d1fae5', // emerald-100
      textSecondary: '#a7f3d0', // emerald-200
      border: '#064e3b', // emerald-900
      gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
      error: '#f87171', // red-400
    },
    mode: 'dark'
  },
  {
    id: 'amber-dark',
    name: 'Amber Glow',
    nameAr: 'توهج العنبر',
    colors: {
      primary: '#f59e0b', // amber-500
      secondary: '#fbbf24', // amber-400
      accent: '#f97316', // orange-500
      background: '#1c1917', // stone-900
      surface: '#292524', // stone-800
      text: '#fef3c7', // amber-100
      textSecondary: '#fde68a', // amber-200
      border: '#78350f', // amber-900
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
      error: '#f87171', // red-400
    },
    mode: 'dark'
  }
];