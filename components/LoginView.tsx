
import React, { useState } from 'react';

interface Props {
  onLogin: (username: string, startingAphids: number) => void;
}

export const LoginView: React.FC<Props> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [startingAphids, setStartingAphids] = useState(40);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onLogin(name.trim(), startingAphids);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-900 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-bug text-emerald-600 text-4xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">AphidSim v1.0</h1>
          <p className="text-gray-500 mt-2 text-sm font-semibold">Level 5: Invertebrates in a Changing World</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest text-left mb-2">Researcher Identity</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Student_12345"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition font-medium"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest text-left">Initial Inoculum</label>
              <span className="text-sm font-black text-emerald-600">{startingAphids} M. persicae</span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="10"
              value={startingAphids}
              onChange={(e) => setStartingAphids(parseInt(e.target.value))}
              className="w-full h-2 bg-emerald-50 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-gray-300 mt-2 font-bold font-mono">
              <span>10</span>
              <span>100</span>
              <span>200</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl transition transform active:scale-95 shadow-lg shadow-emerald-100 uppercase tracking-widest text-sm"
          >
            Start Experiment
          </button>
        </form>
        
        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-400 leading-relaxed italic text-left">
          <i className="fas fa-info-circle mr-1"></i>
          Note: Starting population will be distributed 50/50 between Nymphs and Apterous Adults. Simulation data persists locally to this browser profile.
        </div>
      </div>
    </div>
  );
};
