
export const MAX_SIM_DAYS = 21; // 3 weeks of experimentation

// Myzus persicae Biological Parameters
export const T_MIN = 4.0;    // Lower development threshold (°C)
export const T_MAX = 32.0;   // Upper limit where development halts/mortality spikes
export const T_OPT = 24.0;   // Optimal temperature for development and reproduction

// Reproduction: A healthy adult female produces ~4-8 nymphs/day at T_OPT
export const MAX_DAILY_FECUNDITY = 6.0; 

// Maturation: Takes ~7-10 days at 20°C to reach adult stage
export const BASE_MATURATION_RATE = 0.12; // ~1/8.3 days

// Carrying Capacity: A single host plant (biomass) can sustain a finite colony
export const CARRYING_CAPACITY = 1500; 

export const COLORS = {
  primary: '#059669', // Emerald-600
  secondary: '#2563eb', // Blue-600
  danger: '#dc2626', // Red-600
  warning: '#d97706', // Amber-600
  nymph: '#94a3b8',   // Slate-400
  apterous: '#10b981', // Emerald-500
  alate: '#3b82f6',    // Blue-500
};
