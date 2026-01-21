
import React from 'react';
import { UserSession } from '../types';

export const StatusCards: React.FC<{ session: UserSession }> = ({ session }) => {
  const { population, plant, sim } = session;
  const plantHealth = (plant.hydration * 0.4 + plant.nutrients * 0.4 + plant.rootHealth * 0.2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        label="Day" 
        value={`${sim.day + 1} / 21`} 
        icon="fa-calendar-day" 
        color="bg-purple-50 text-purple-600"
        sub={`Next: Day ${sim.day + 2}`}
      />
      <StatCard 
        label="Total Population" 
        value={Math.floor(population.total).toLocaleString()} 
        icon="fa-bug" 
        color="bg-emerald-50 text-emerald-600"
        sub={`${Math.floor(population.adultsAlate)} Winged`}
      />
      <StatCard 
        label="Plant Health" 
        value={`${Math.floor(plantHealth)}%`} 
        icon="fa-leaf" 
        color="bg-green-50 text-green-600"
        progress={plantHealth}
      />
      <StatCard 
        label="Mortality" 
        value={Math.floor(population.cumulativeMortality).toLocaleString()} 
        icon="fa-skull-crossbones" 
        color="bg-red-50 text-red-600"
        sub="Cumulative"
      />
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, icon: string, color: string, sub?: string, progress?: number }> = ({ label, value, icon, color, sub, progress }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
    <div className="text-2xl font-black text-gray-800">{value}</div>
    {sub && <div className="text-[10px] text-gray-400 mt-1 font-mono uppercase">{sub}</div>}
    {progress !== undefined && (
      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
        <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
      </div>
    )}
  </div>
);
