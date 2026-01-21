
import { useState, useCallback } from 'react';
import { UserSession, HistoryPoint, LogEntry, BioticThreat } from '../types';
import { MAX_SIM_DAYS, BASE_MATURATION_RATE } from '../constants';
import { getFecundity, getMortality, getAlateProductionRatio, getPerformanceIndex, getHostQualityFactor } from '../utils/formulas';

const THREAT_POOL: Omit<BioticThreat, 'id' | 'discovered'>[] = [
  { name: "Coccinellidae (Ladybird)", type: 'predator', severity: 0.15 },
  { name: "Aphidius colemani", type: 'parasitoid', severity: 0.10 },
  { name: "Entomopathogenic Fungi", type: 'pathogen', severity: 0.20 }
];

export function useSimulation(initialSession: UserSession) {
  const [session, setSession] = useState<UserSession>(initialSession);

  const addLog = (entry: Omit<LogEntry, 'day'>) => {
    setSession(prev => ({
      ...prev,
      sim: {
        ...prev.sim,
        actionLog: [{ ...entry, day: prev.sim.day }, ...prev.sim.actionLog].slice(0, 50)
      }
    }));
  };

  const advanceDay = useCallback(() => {
    setSession(prev => {
      if (prev.sim.day >= MAX_SIM_DAYS) return prev;

      const currentDay = prev.sim.day;
      const plantHealth = (prev.plant.hydration * 0.35 + prev.plant.nutrients * 0.45 + prev.plant.rootHealth * 0.2);
      
      const hostQuality = getHostQualityFactor(plantHealth);
      const fecundityPerAdult = getFecundity(prev.sim.temperature, plantHealth, prev.population.total, prev.sim.bioticThreats);
      const { rate: mortalityRate, cause: mortalityCause } = getMortality(prev.sim.temperature, plantHealth, prev.plant.rootHealth, prev.sim.bioticThreats);
      const alateRatio = getAlateProductionRatio(prev.population.total, plantHealth);
      const devPerformance = getPerformanceIndex(prev.sim.temperature);

      // Population Math
      // Development is the product of thermal performance AND host quality
      const effectiveMaturation = BASE_MATURATION_RATE * devPerformance * hostQuality;
      
      const newNymphs = (prev.population.adultsApterous + prev.population.adultsAlate * 0.4) * fecundityPerAdult;
      const deathCount = prev.population.total * mortalityRate;
      const maturedTotal = prev.population.nymphs * effectiveMaturation;
      const newAlates = maturedTotal * alateRatio;
      const newApterous = maturedTotal * (1 - alateRatio);

      const nextPop = {
        ...prev.population,
        nymphs: Math.max(0, prev.population.nymphs + newNymphs - maturedTotal - (deathCount * 0.6)),
        adultsApterous: Math.max(0, prev.population.adultsApterous + newApterous - (deathCount * 0.3)),
        adultsAlate: Math.max(0, prev.population.adultsAlate + newAlates - (deathCount * 0.1)),
        cumulativeFecundity: prev.population.cumulativeFecundity + newNymphs,
        cumulativeMortality: prev.population.cumulativeMortality + deathCount,
        dailyMortalityLog: [...prev.population.dailyMortalityLog, { day: currentDay, count: Math.floor(deathCount), cause: mortalityCause }]
      };
      nextPop.total = nextPop.nymphs + nextPop.adultsApterous + nextPop.adultsAlate;

      // Plant Math
      let nextRootHealth = prev.plant.rootHealth;
      let feedback = "";
      const popStress = (nextPop.total / 800) * 3;
      const nextNutrients = Math.max(0, prev.plant.nutrients - 3 - popStress);
      // Evapotranspiration increases with temperature
      const nextHydration = Math.max(0, prev.plant.hydration - 12 - (prev.sim.temperature / 4));

      // Overwatering sensitivity
      if (prev.plant.hydration > 92) {
        nextRootHealth = Math.max(0, prev.plant.rootHealth - 15);
        if (nextRootHealth < 50) feedback = "Biological Warning: Root rot suspected due to soil saturation.";
      } else {
        nextRootHealth = Math.min(100, prev.plant.rootHealth + 1);
      }

      // Random Biotic Threats
      let nextThreats = [...prev.sim.bioticThreats];
      if (currentDay > 2 && Math.random() < 0.15 && nextThreats.length < 2) {
        const template = THREAT_POOL[Math.floor(Math.random() * THREAT_POOL.length)];
        nextThreats.push({ ...template, id: Math.random().toString(36).substr(2, 9), discovered: false });
        feedback = feedback || "Field Observation: Unidentified ecological shift detected. Suggest health check.";
      }

      const nextHistoryPoint: HistoryPoint = {
        day: currentDay,
        totalPopulation: nextPop.total,
        temp: prev.sim.temperature,
        alateCount: nextPop.adultsAlate,
        apterousCount: nextPop.adultsApterous,
        nymphCount: nextPop.nymphs,
        plantHealth: plantHealth,
        fecundity: newNymphs,
        mortality: deathCount,
        threatLevel: nextThreats.reduce((a, b) => a + b.severity, 0)
      };

      const nextSession: UserSession = {
        ...prev,
        population: nextPop,
        plant: { ...prev.plant, hydration: nextHydration, nutrients: nextNutrients, rootHealth: nextRootHealth, age: prev.plant.age + 1 },
        sim: {
          ...prev.sim,
          day: currentDay + 1,
          history: [...prev.sim.history, nextHistoryPoint],
          isComplete: currentDay + 1 >= MAX_SIM_DAYS,
          bioticThreats: nextThreats,
          actionLog: feedback 
            ? [{ day: currentDay, action: "Bio-Alert", feedback, type: 'biological' }, ...prev.sim.actionLog] 
            : prev.sim.actionLog
        }
      };

      localStorage.setItem(`aphidsim_${prev.username}`, JSON.stringify(nextSession));
      return nextSession;
    });
  }, []);

  const setTemperature = (temp: number) => {
    setSession(s => ({ ...s, sim: { ...s.sim, temperature: temp } }));
    addLog({ action: "Temp Set", feedback: `Incubator adjusted to ${temp}°C.`, type: 'action' });
  };

  const waterPlant = () => {
    setSession(s => {
      const isSaturated = s.plant.hydration > 85;
      return { 
        ...s, 
        plant: { ...s.plant, hydration: Math.min(100, s.plant.hydration + 45) },
        sim: { ...s.sim, actionLog: [{ day: s.sim.day, action: "Watered", feedback: isSaturated ? "Substrate saturated. Monitoring for anoxia." : "Irrigation complete.", type: 'action' }, ...s.sim.actionLog] }
      };
    });
  };

  const feedPlant = () => {
    setSession(s => ({ 
      ...s, 
      plant: { ...s.plant, nutrients: Math.min(100, s.plant.nutrients + 30) },
      sim: { ...s.sim, actionLog: [{ day: s.sim.day, action: "Fertilized", feedback: "Nutrient levels restored.", type: 'action' }, ...s.sim.actionLog] }
    }));
  };

  const checkColony = () => {
    setSession(s => {
      const newlyDiscovered = s.sim.bioticThreats.some(t => !t.discovered);
      const nextThreats = s.sim.bioticThreats.map(t => ({ ...t, discovered: true }));
      const msg = newlyDiscovered 
        ? `Health check reveals: ${nextThreats.map(t => t.name).join(', ')}` 
        : "No new biotic threats identified.";
      return {
        ...s,
        sim: { 
          ...s.sim, 
          lastHealthCheck: s.sim.day, 
          bioticThreats: nextThreats,
          actionLog: [{ day: s.sim.day, action: "Health Check", feedback: msg, type: 'biological' }, ...s.sim.actionLog]
        }
      };
    });
  };

  const removeThreats = () => {
    setSession(s => {
      const removedCount = s.sim.bioticThreats.filter(t => t.discovered).length;
      return {
        ...s,
        sim: {
          ...s.sim,
          bioticThreats: s.sim.bioticThreats.filter(t => !t.discovered), // only keeps undiscovered ones
          actionLog: [{ day: s.sim.day, action: "Sanitization", feedback: `Intervention successful. ${removedCount} identified threats removed.`, type: 'action' }, ...s.sim.actionLog]
        }
      };
    });
  };

  const changePlant = () => {
    setSession(s => ({
      ...s,
      plant: { hydration: 100, nutrients: 100, age: 0, biomass: 1000, rootHealth: 100 },
      population: { ...s.population, total: s.population.total * 0.75, nymphs: s.population.nymphs * 0.75, adultsApterous: s.population.adultsApterous * 0.75, adultsAlate: s.population.adultsAlate * 0.25 },
      sim: { ...s.sim, bioticThreats: [], actionLog: [{ day: s.sim.day, action: "Reset Host", feedback: "Colony relocated. Mesocosm reset.", type: 'action' }, ...s.sim.actionLog] }
    }));
  };

  return { session, setTemperature, waterPlant, feedPlant, changePlant, advanceDay, checkColony, removeThreats };
}
