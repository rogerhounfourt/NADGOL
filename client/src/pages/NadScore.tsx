import React, { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Loading, Empty, ErrorState } from "@/components/PageState";
import { useAthletes, useAthleteMetrics, useMatchLog, usePhysicalEvals, useEvaluations } from "@/lib/queries";
import ReportButton from "@/components/ReportButton";
import { relatorioAtleta } from "@/lib/relatorios";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Zap, TrendingUp, Award, Target, Trophy } from "lucide-react";

const NadScore = () => {
  const { currentUser } = useApp();
  const atl = useAthletes();
  const lista = (atl.data ?? []).filter(a => a.status === "active");
  const [atletaId, setAtletaId] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");
  useEffect(() => {
    if (atletaId || lista.length === 0) return;
    setAtletaId(lista.find(a => a.id === currentUser?.atletaId)?.id ?? lista[0].id);
  }, [lista, atletaId, currentUser?.atletaId]);
  const jogosQ = useMatchLog(atletaId);
  const metricas = useAthleteMetrics();
  const fisicas = usePhysicalEvals(atletaId);
  const avaliacoes = useEvaluations(atletaId);

  const m = (metricas.data ?? []).find(x => x.id === atletaId);
  const jogos = jogosQ.data ?? [];
  const dm = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;
  const recentMatches = jogos.slice(0, 10).map(j => ({ id: j.id, opponent: j.adversario, date: dm(j.data), nadscore: j.nadscore ?? 0, gols: j.gols, assists: j.assistencias, status: j.competicao ? "oficial" : "amistoso" }));
  const performanceData = [...jogos].reverse().slice(-8).map(j => ({ week: j.data.slice(8, 10) + "/" + j.data.slice(5, 7), nadscore: j.nadscore ?? 0, gols: j.gols, assistencias: j.assistencias }));
  const velMax = Math.max(0, ...(fisicas.data ?? []).map(f => f.velocidade ?? 0));
  const totalGols = jogos.reduce((t, j) => t + j.gols, 0);
  const totalAss = jogos.reduce((t, j) => t + j.assistencias, 0);

  const stats = [
    { label: "Gols", value: String(totalGols), icon: Target, color: "text-red-500" },
    { label: "Assistências", value: String(totalAss), icon: Zap, color: "text-yellow-500" },
    { label: "Velocidade Máx", value: velMax ? `${velMax} km/h` : "—", icon: Activity, color: "text-blue-500" },
    { label: "Jogos", value: String(jogos.length), icon: Trophy, color: "text-orange-500" },
  ];

  const melhorSemana = Math.max(0, ...[...jogos].map(j => j.gols));
  const achievements = [
    { name: "Artilheiro", icon: "🔥", description: "5+ gols no total", ok: totalGols >= 5 },
    { name: "Velocista", icon: "⚡", description: "30+ km/h de velocidade", ok: velMax >= 30 },
    { name: "Consistente", icon: "📈", description: "10 partidas disputadas", ok: jogos.length >= 10 },
    { name: "Destaque", icon: "⭐", description: "NadScore 9.0+ em um jogo", ok: jogos.some(j => (j.nadscore ?? 0) >= 9) },
    { name: "Hat-trick", icon: "🎩", description: "3+ gols em um jogo", ok: melhorSemana >= 3 },
  ];

  if (atl.isLoading) return <Loading />;
  if (atl.isError) return <ErrorState onRetry={() => atl.refetch()} />;
  if (lista.length === 0) return <Empty title="Nenhum atleta" hint="Cadastre atletas e registre jogos para ver o NadScore." />;

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
            <span className="text-3xl font-bold">{m?.nadscore ?? "—"}</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">NadScore Performance</h1>
            <p className="text-gray-400">Sistema de Monitoramento Esportivo Nadgol Academy</p>
            <div className="mt-2">
              <ReportButton disabled={!m} label="Baixar relatório PDF" onClick={() => m && relatorioAtleta({ escola: currentUser?.escolaNome ?? "Nadgol Academy", metrica: m, jogos, fisicas: fisicas.data ?? [], avaliacoes: avaliacoes.data ?? [] })} />
            </div>
            {lista.length > 1 && (
              <select value={atletaId} onChange={(e) => setAtletaId(e.target.value)} className="mt-2 bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white">
                {lista.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            )}
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
        {["overview", "matches", "achievements"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 font-semibold transition ${
              selectedTab === tab
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {{ overview: "Visão geral", matches: "Partidas", achievements: "Conquistas" }[tab]}
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
                Gols e Assistências por Jogo
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="week" stroke="#666" />
                  <YAxis stroke="#666" allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #444", borderRadius: "8px" }} labelStyle={{ color: "#fff" }} />
                  <Legend />
                  <Bar dataKey="gols" name="Gols" fill="#ef4444" />
                  <Bar dataKey="assistencias" name="Assistências" fill="#eab308" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedTab === "matches" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Partidas Recentes</h2>
            {recentMatches.length === 0 && <p className="text-gray-400 text-sm">Nenhuma partida registrada para este atleta.</p>}
            {recentMatches.map((match) => (
              <div
                key={match.id}
                className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-red-600 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{match.opponent}</h3>
                    <p className="text-gray-400 text-sm">{match.date}</p>
                    <div className="flex gap-4 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${match.status === "oficial" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}>
                        {match.status === "oficial" ? "Competição" : "Amistoso"}
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

        {selectedTab === "achievements" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, idx) => (
              <div key={idx} className={`bg-gray-900 rounded-lg p-6 border-2 transition text-center ${achievement.ok ? "border-yellow-500" : "border-gray-800 opacity-40"}`}>
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className="font-bold text-sm mb-1">{achievement.name}</h3>
                <p className="text-xs text-gray-400">{achievement.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default NadScore;
