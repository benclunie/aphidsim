
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { HistoryPoint } from '../types';

export const DataCharts: React.FC<{ history: HistoryPoint[] }> = ({ history }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-80">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center uppercase tracking-widest">
          <i className="fas fa-chart-line mr-2 text-emerald-500"></i> Population Dynamics
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="apterousCount" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Apterous" />
            <Area type="monotone" dataKey="alateCount" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Alate" />
            <Area type="monotone" dataKey="nymphCount" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} name="Nymphs" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-80">
        <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center uppercase tracking-widest">
          <i className="fas fa-leaf mr-2 text-blue-500"></i> Vital Health Indices
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            <Line type="monotone" dataKey="plantHealth" stroke="#10b981" strokeWidth={3} dot={false} name="Plant Health" />
            <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Temp (°C)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
