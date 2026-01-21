
import React, { useState, useEffect } from 'react';
import { UserSession } from './types';
import { LoginView } from './components/LoginView';
import { useSimulation } from './hooks/useSimulation';
import { StatusCards } from './components/StatusCards';
import { DataCharts } from './components/DataCharts';
import { getSoilStatus, getHostQualityFactor } from './utils/formulas';

const INITIAL_STATE = (username: string, startingAphids: number): UserSession => {
  const half = Math.floor(startingAphids / 2);
  return {
    username,
    startDate: Date.now(),
    population: {
      total: startingAphids,
      nymphs: half,
      adultsApterous: startingAphids - half,
      adultsAlate: 0,
      avgWeight: 0.4,
      cumulativeFecundity: 0,
      cumulativeMortality: 0,
      dailyMortalityLog: []
    },
    plant: { hydration: 100, nutrients: 100, age: 0, biomass: 1000, rootHealth: 100 },
    sim: {
      day: 0,
      temperature: 20,
      history: [],
      actionLog: [{ day: 0, action: "Setup", feedback: `Invertebrate mesocosm ready with ${startingAphids} individuals.`, type: 'action' }],
      isComplete: false,
      bioticThreats: [],
      lastHealthCheck: 0
    }
  };
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<UserSession | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('aphidsim_active_user');
    if (savedUser) {
      setCurrentUser(savedUser);
      const savedData = localStorage.getItem(`aphidsim_${savedUser}`);
      if (savedData) setSessionData(JSON.parse(savedData));
    }
  }, []);

  const handleLogin = (username: string, startingAphids: number) => {
    setCurrentUser(username);
    localStorage.setItem('aphidsim_active_user', username);
    const savedData = localStorage.getItem(`aphidsim_${username}`);
    if (savedData) {
      setSessionData(JSON.parse(savedData));
    } else {
      const newState = INITIAL_STATE(username, startingAphids);
      setSessionData(newState);
      localStorage.setItem(`aphidsim_${username}`, JSON.stringify(newState));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setSessionData(null);
    localStorage.removeItem('aphidsim_active_user');
  };

  if (!currentUser || !sessionData) return <LoginView onLogin={handleLogin} />;
  return <GameDashboard initialSession={sessionData} onLogout={logout} />;
};

const GameDashboard: React.FC<{ initialSession: UserSession, onLogout: () => void }> = ({ initialSession, onLogout }) => {
  const { session, setTemperature, waterPlant, feedPlant, changePlant, advanceDay, checkColony, removeThreats } = useSimulation(initialSession);
  const [showRawData, setShowRawData] = useState(false);
  
  const soilStatus = getSoilStatus(session.plant.hydration);
  const threatCount = session.sim.bioticThreats.length;
  const discoveredThreats = session.sim.bioticThreats.filter(t => t.discovered);
  
  const plantHealth = (session.plant.hydration * 0.35 + session.plant.nutrients * 0.45 + session.plant.rootHealth * 0.2);
  const hostQuality = getHostQualityFactor(plantHealth);

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <i className="fas fa-flask"></i>
          </div>
          <h1 className="text-lg font-black tracking-tight">AphidSim <span className="text-emerald-500 italic">Core</span></h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowRawData(!showRawData)}
            className="px-4 py-2 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            <i className={`fas ${showRawData ? 'fa-th' : 'fa-list'} mr-2`}></i>
            {showRawData ? 'Dashboard' : 'Data Log'}
          </button>
          <div className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full">{session.username}</div>
          <button onClick={onLogout} className="text-slate-300 hover:text-red-500 transition"><i className="fas fa-power-off"></i></button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Environmental Controls */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Environment Control</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-bold text-slate-600">Incubator Temp</span>
                  <span className="text-xl font-black text-emerald-600">{session.sim.temperature}°C</span>
                </div>
                <input
                  type="range" min="5" max="35" step="0.5"
                  value={session.sim.temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={waterPlant} className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 hover:bg-blue-100 transition active:scale-95">
                  <i className="fas fa-droplet mb-1"></i>
                  <span className="text-[10px] font-black uppercase">Irrigation</span>
                  <span className="text-[8px] mt-1 font-bold opacity-60">{soilStatus}</span>
                </button>
                <button onClick={feedPlant} className="flex flex-col items-center justify-center p-4 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100 hover:bg-amber-100 transition active:scale-95">
                  <i className="fas fa-leaf mb-1"></i>
                  <span className="text-[10px] font-black uppercase">Nutrition</span>
                  <span className="text-[8px] mt-1 font-bold opacity-60">NH4/NO3 Mix</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-50 space-y-3">
                <button 
                  onClick={checkColony}
                  className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-black transition flex items-center justify-center shadow-lg"
                >
                  <i className="fas fa-search-plus mr-2"></i> HEALTH CHECK
                </button>
                {discoveredThreats.length > 0 && (
                  <button 
                    onClick={removeThreats}
                    className="w-full py-3 bg-red-600 text-white rounded-2xl font-black text-xs hover:bg-red-700 transition flex items-center justify-center animate-pulse"
                  >
                    <i className="fas fa-hand-sparkles mr-2"></i> REMOVE THREATS
                  </button>
                )}
              </div>

              <button 
                onClick={advanceDay}
                disabled={session.sim.isComplete}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition transform active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-emerald-100"
              >
                ADVANCE DAY
              </button>
            </div>
          </section>

          {/* Action Log */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[350px]">
            <div className="px-6 py-4 border-b border-slate-50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Colony Log</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
              {session.sim.actionLog.map((log, i) => (
                <div key={i} className={`p-3 rounded-xl border-l-4 ${log.type === 'biological' ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between text-[10px] font-bold opacity-50 mb-1">
                    <span>DAY {log.day + 1}</span>
                    <span className="uppercase">{log.action}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-semibold leading-tight">{log.feedback}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          {showRawData ? (
            <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 min-h-[700px]">
              <h2 className="text-xl font-black mb-6">Biometric Data Log</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="p-4">DAY</th>
                      <th className="p-4">TOTAL</th>
                      <th className="p-4">NYMPH</th>
                      <th className="p-4">APTEROUS</th>
                      <th className="p-4">ALATE</th>
                      <th className="p-4">MORTALITY</th>
                      <th className="p-4">PLANT %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {session.sim.history.map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-bold">{h.day + 1}</td>
                        <td className="p-4">{Math.floor(h.totalPopulation)}</td>
                        <td className="p-4">{Math.floor(h.nymphCount)}</td>
                        <td className="p-4 text-emerald-600">{Math.floor(h.apterousCount)}</td>
                        <td className="p-4 text-blue-600">{Math.floor(h.alateCount)}</td>
                        <td className="p-4 text-red-500 font-bold">{Math.floor(h.mortality)}</td>
                        <td className="p-4">{Math.floor(h.plantHealth)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <>
              <StatusCards session={session} />
              <DataCharts history={session.sim.history} />
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Host Quality & Growth</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                        <span className="text-xs font-bold text-slate-600">Host Efficiency</span>
                        <span className={`text-xs font-black ${hostQuality < 0.6 ? 'text-amber-500' : 'text-emerald-500'}`}>{Math.floor(hostQuality * 100)}%</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Maturation speed and offspring production are linked to phloem quality. 
                        Water stress slows down nymph maturation by {Math.floor((1 - hostQuality) * 100)}%.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Biosecurity</h4>
                    <div className="flex gap-2">
                      {discoveredThreats.map(t => (
                        <div key={t.id} className="text-[9px] font-black px-2 py-1 bg-red-100 text-red-600 rounded-lg uppercase">
                          {t.name}
                        </div>
                      ))}
                      {threatCount === 0 && <span className="text-[10px] text-emerald-500 font-bold">Colony Sterile</span>}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Host Plant Diagnostics</h3>
                  <div className="space-y-4">
                    <DiagRow label="Root Health" value={session.plant.rootHealth} />
                    <DiagRow label="Soil Hydration" value={session.plant.hydration} color="blue" />
                    <DiagRow label="Nutrient Balance" value={session.plant.nutrients} color="amber" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

const DiagRow: React.FC<{ label: string, value: number, color?: string }> = ({ label, value, color = 'emerald' }) => (
  <div>
    <div className="flex justify-between text-[10px] font-bold mb-1">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900">{Math.floor(value)}%</span>
    </div>
    <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-1000 ${color === 'blue' ? 'bg-blue-500' : color === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

export default App;
