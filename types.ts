
export interface AphidPopulation {
  total: number;
  nymphs: number;
  adultsApterous: number; // Wingless adults
  adultsAlate: number;   // Winged adults (migrants)
  avgWeight: number;     // mg
  cumulativeFecundity: number;
  cumulativeMortality: number;
  dailyMortalityLog: Array<{ day: number; count: number; cause: string }>;
}

export interface BioticThreat {
  id: string;
  name: string;
  type: 'predator' | 'parasitoid' | 'pathogen';
  severity: number; // 0-1 multiplier for impact
  discovered: boolean;
}

export interface PlantState {
  hydration: number; // 0 to 100
  nutrients: number; // 0 to 100
  age: number;       // days
  biomass: number;   // Capacity for aphids
  rootHealth: number; // Affects plant health, damaged by overwatering
}

export interface LogEntry {
  day: number;
  action: string;
  feedback: string;
  type: 'action' | 'feedback' | 'biological';
}

export interface SimState {
  day: number;
  temperature: number; // Celsius
  history: HistoryPoint[];
  actionLog: LogEntry[];
  isComplete: boolean;
  bioticThreats: BioticThreat[];
  lastHealthCheck: number; // The day the last check was performed
}

export interface HistoryPoint {
  day: number;
  totalPopulation: number;
  temp: number;
  alateCount: number;
  apterousCount: number;
  nymphCount: number;
  plantHealth: number;
  fecundity: number;
  mortality: number;
  threatLevel: number; // Aggregate biotic stress
}

export interface UserSession {
  username: string;
  startDate: number;
  population: AphidPopulation;
  plant: PlantState;
  sim: SimState;
}
