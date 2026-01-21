
import { T_MIN, T_MAX, T_OPT, MAX_DAILY_FECUNDITY, CARRYING_CAPACITY } from '../constants';
import { BioticThreat } from '../types';

/**
 * Lactin-2 style development rate curve normalized 0-1 for temperature.
 */
export function getPerformanceIndex(temp: number): number {
  if (temp <= T_MIN || temp >= T_MAX) return 0;
  if (temp <= T_OPT) {
    return Math.pow(Math.sin((Math.PI / 2) * (temp - T_MIN) / (T_OPT - T_MIN)), 2);
  } else {
    return Math.max(0, 1 - Math.pow((temp - T_OPT) / (T_MAX - T_OPT), 2));
  }
}

/**
 * Calculates the Host Quality Factor (0.2 to 1.0).
 * Poor plant health significantly stunts development and reproduction.
 */
export function getHostQualityFactor(plantHealth: number): number {
  // Maturation and fecundity drop sharply once plant health falls below 60%
  return Math.max(0.15, Math.pow(plantHealth / 100, 1.5));
}

export function getFecundity(temp: number, plantHealth: number, totalPop: number, threats: BioticThreat[]): number {
  const performance = getPerformanceIndex(temp);
  const hostQuality = getHostQualityFactor(plantHealth);
  const densityMultiplier = Math.max(0.1, 1 - (totalPop / CARRYING_CAPACITY));
  
  const parasitoidStress = threats
    .filter(t => t.type === 'parasitoid')
    .reduce((acc, t) => acc + t.severity, 0);
  const reproductionPenalty = Math.max(0.5, 1 - parasitoidStress);

  return MAX_DAILY_FECUNDITY * performance * hostQuality * densityMultiplier * reproductionPenalty;
}

export function getMortality(temp: number, plantHealth: number, rootHealth: number, threats: BioticThreat[]): { rate: number; cause: string } {
  let rate = 0.03; 
  let cause = "Natural senescence";

  if (temp > 28) {
    const heatImpact = (temp - 28) * 0.08;
    if (heatImpact > rate - 0.03) {
      rate += heatImpact;
      cause = "Heat stress (Desiccation)";
    }
  } else if (temp < 8) {
    const coldImpact = (8 - temp) * 0.04;
    rate += coldImpact;
    cause = "Cold-induced metabolic failure";
  }

  if (plantHealth < 40) {
    const starvation = (40 - plantHealth) * 0.015;
    rate += starvation;
    if (plantHealth < 15) cause = "Host plant necrosis (Starvation)";
  }

  if (rootHealth < 40) {
    rate += (40 - rootHealth) * 0.005;
    if (rootHealth < 20) cause = "Anoxic conditions / Root failure";
  }

  const bioticRate = threats.reduce((acc, t) => acc + t.severity, 0);
  if (bioticRate > 0) {
    rate += bioticRate;
    const majorThreat = threats.sort((a, b) => b.severity - a.severity)[0];
    cause = `Biotic stress: ${majorThreat.name}`;
  }

  return { rate: Math.min(0.98, rate), cause };
}

export function getAlateProductionRatio(totalPop: number, plantHealth: number): number {
  const densityTrigger = totalPop > (CARRYING_CAPACITY * 0.3) 
    ? (totalPop / CARRYING_CAPACITY) * 0.6 
    : 0.02;
  const healthTrigger = plantHealth < 60 ? (60 - plantHealth) / 100 : 0;
  return Math.min(0.8, densityTrigger + healthTrigger);
}

export function getSoilStatus(hydration: number): string {
  if (hydration > 92) return "Saturated (Danger)";
  if (hydration > 75) return "Damp (Optimal)";
  if (hydration > 50) return "Moist";
  if (hydration > 25) return "Dry (Water Soon)";
  return "Parched (Wilting)";
}
