import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Zap, TrendingUp, Award, Target, Heart, Flame } from "lucide-react";

interface Match {
  id: number;
  opponent: string;
  date: string;
  nadscore: number;
  gols: number;
  assists: number;
  status: string;
}

const NadScore = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Mock data for performance
  const performanceData = [
    { week: "Sem 1", nadscore: 7.2, gols: 1, assistencias: 0 },
    { week: "Sem 2", nadscore: 8.1, gols: 2, assistencias: 1 },
    { week: "Sem 3", nadscore: 7.8, gols: 1, assistencias: 2 },
    { week: "Sem 4", nadscore: 8.9, gols: 3, assistencias: 1 },
    { week: "Sem 5", nadscore: 9.2, gols: 2, assistencias: 2 },
  ];

  const recentMatches = [
    { id: 1, opponent: "Flamengo Academy", date: "17/05/2026", nadscore: 9.2, gols: 2, assists: 1, status: "oficial" },
    { id: 2, opponent: "Vasco Academy", date: "15/05/2026", nadscore: 8.1, gols: 1, assists: 2, status: "oficial" },
    { id: 3, opponent: "Rachão Parque", date: "14/05/2026", nadscore: 7.5, gols: 3, assists: 0, status: "rua" },
  ];

  const stats = [
    { label: "Gols", value: "18", icon: Target, color: "text-red-500" },
    { label: "Assistências", value: "8", icon: Zap, color: "text-yellow-500" },
    { label: "Velocidade Máx", value: "32.5 km/h", icon: Activity, color: "text-blue-500" },
    { label: "Calorias", value: "2,450", icon: Flame, color: "text-orange-500" },
  ];

  const achievements = [
    { name: "Artilheiro", icon: "🔥", description: "5+ gols em uma semana" },
    { name: "Velocista", icon: "⚡", description: "30+ km/h de velocidade" },
    { name: "Consistente", icon: "📈", description: "10 partidas consecutivas" },
    { name: "Destaque", icon: "⭐", description: "NadScore 9.0+" },
  ];

  const heatmapData = [
    { zone: "Ataque", percentage: 35, color: "#ef4444" },
    { zone: "Meio", percentage: 40, color: "#f59e0b" },
    { zone: "Defesa", percentage: 25, color: "#3b82f6" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
            <span className="text-3xl font-bold">9.2</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">NadScore Performance</h1>
            <p className="text-gray-400">Sistema de Monitoramento Esportivo Nadgol Academy</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-red-600 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-800">
        {["overview", "matches", "heatmap", "achievements"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 font-semibold transition ${
              selectedTab === tab
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-8">
        {selectedTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Chart */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                Evolução Semanal
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="week" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #444", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="nadscore" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Distribution */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Distribuição de Atividade
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={heatmapData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ zone, percentage }) => `${zone} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                  >
                    {heatmapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedTab === "matches" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Partidas Recentes</h2>
            {recentMatches.map((match) => (
              <div
                key={match.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-red-600 transition cursor-pointer"
                onClick={() => setSelectedMatch(match)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{match.opponent}</h3>
                    <p className="text-gray-400 text-sm">{match.date}</p>
                    <div className="flex gap-4 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${match.status === "oficial" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}>
                        {match.status === "oficial" ? "Oficial" : "Futebol de Rua"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-red-500">{match.nadscore}</div>
                    <p className="text-gray-400 text-sm">NadScore</p>
                    <div className="mt-2 text-sm">
                      <p>⚽ {match.gols} gols</p>
                      <p>🎯 {match.assists} assistências</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === "heatmap" && (
          <div className="bg-gray-900 rounded-lg p-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Mapa de Calor - Movimentação em Campo</h2>
            <div className="relative w-full aspect-video bg-gradient-to-b from-green-900 to-green-800 rounded-lg overflow-hidden border-2 border-gray-700">
              {/* Football field */}
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                {/* Field lines */}
                <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <circle cx="50" cy="50" r="1" fill="white" />
                <rect x="0" y="35" width="20" height="30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <rect x="80" y="35" width="20" height="30" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />

                {/* Heatmap zones */}
                <ellipse cx="30" cy="50" rx="15" ry="20" fill="#ef4444" opacity="0.6" />
                <ellipse cx="50" cy="50" rx="12" ry="18" fill="#f59e0b" opacity="0.5" />
                <ellipse cx="70" cy="50" rx="10" ry="15" fill="#3b82f6" opacity="0.4" />
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 p-4 rounded-lg text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Alta intensidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Média intensidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Baixa intensidade</span>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="mt-6 space-y-3">
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
                <p className="text-sm text-gray-300">
                  💡 <strong>Insight:</strong> Você teve maior presença no setor de ataque (35% do tempo)
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm text-gray-300">
                  💡 <strong>Insight:</strong> Sua movimentação foi mais centralizada nesta partida
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "achievements" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, idx) => (
              <div key={idx} className="bg-gray-900 rounded-lg p-6 border-2 border-gray-800 hover:border-yellow-500 transition text-center">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-bold text-sm mb-1">{achievement.name}</h3>
                <p className="text-xs text-gray-400">{achievement.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post-Match Questionnaire Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full border border-red-600">
            <h2 className="text-2xl font-bold mb-6">Avaliação da Partida</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Como avalia seu desempenho?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="text-2xl hover:scale-110 transition">
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Nível de cansaço?</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                  <option>Muito cansado</option>
                  <option>Cansado</option>
                  <option>Normal</option>
                  <option>Energizado</option>
                </select>
              </div>
              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition">
                Enviar Avaliação
              </button>
              <button
                onClick={() => setSelectedMatch(null)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NadScore;
