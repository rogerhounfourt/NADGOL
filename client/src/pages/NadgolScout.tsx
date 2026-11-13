import React, { useState } from "react";
import { Loading, Empty, ErrorState } from "@/components/PageState";
import { useAthleteMetrics, usePhysicalEvals, useEvaluations, TIPO_AVALIACAO, type TipoAvaliacao } from "@/lib/queries";
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Search, Filter, Download, Eye, Star } from "lucide-react";

interface Athlete {
  id: string;
  name: string;
  position: string;
  age: number;
  nadscore: number | string;
  presenca: number;
  overall: number;
  goals: number;
  assists: number;
}

const NadgolScout = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [filterPosition, setFilterPosition] = useState("all");

  const q = useAthleteMetrics();
  const athletes: Athlete[] = (q.data ?? []).map(m => ({
    id: m.id, name: m.nome, position: m.posicao, age: m.idade, nadscore: m.nadscore ?? "—", presenca: m.presenca,
    overall: m.overall, goals: m.gols, assists: m.assistencias,
  }));
  const posicoes = Array.from(new Set(athletes.map(a => a.position).filter(p => p && p !== "—")));
  const fisicas = usePhysicalEvals(selectedAthlete?.id ?? "");
  const avals = useEvaluations(selectedAthlete?.id ?? "");
  const performanceData = (fisicas.data ?? []).map(f => ({ week: f.data.slice(8, 10) + "/" + f.data.slice(5, 7), velocidade: f.velocidade, resistencia: f.resistencia, vo2: f.vo2 }));
  const radarData = (Object.keys(TIPO_AVALIACAO) as TipoAvaliacao[]).map(t => ({
    attribute: TIPO_AVALIACAO[t],
    value: (avals.data ?? []).find(a => a.tipo === t)?.nota ?? 0,
  }));

  const filteredAthletes = athletes.filter((athlete) => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPosition === "all" || athlete.position === filterPosition;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ padding: "24px", background: "#0A0A0A", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <img
            src="/escudo-nadgol.svg"
            alt="Nadgol Shield"
            style={{ width: "32px", height: "32px" }}
          />
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#FFFFFF", margin: 0 }}>
            Nadgol Scout
          </h1>
        </div>
        <p style={{ color: "#999999", fontSize: "14px", margin: 0 }}>
          Visualização profissional de atletas para clubes, observadores e empresários
        </p>
      </div>

      {/* Search and Filter */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: "12px", top: "12px", color: "#666666", width: "20px" }} />
          <input
            type="text"
            placeholder="Buscar atleta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 12px 12px 40px",
              background: "#1A1A1A",
              border: "1px solid #333333",
              borderRadius: "8px",
              color: "#FFFFFF",
              fontSize: "14px",
            }}
          />
        </div>
        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          style={{
            padding: "12px",
            background: "#1A1A1A",
            border: "1px solid #333333",
            borderRadius: "8px",
            color: "#FFFFFF",
            fontSize: "14px",
          }}
        >
          <option value="all">Todas as Posições</option>
          {posicoes.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {q.isLoading && <Loading />}
      {q.isError && <ErrorState onRetry={() => q.refetch()} />}
      {q.isSuccess && athletes.length === 0 && <Empty title="Nenhum atleta" hint="Cadastre atletas para vê-los aqui." />}

      {/* Athletes Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {filteredAthletes.map((athlete) => (
          <div
            key={athlete.id}
            onClick={() => setSelectedAthlete(athlete)}
            style={{
              background: "#1A1A1A",
              border: selectedAthlete?.id === athlete.id ? "2px solid #CC1A1A" : "1px solid #333333",
              borderRadius: "12px",
              padding: "16px",
              cursor: "pointer",
              transition: "all 200ms",
              transform: selectedAthlete?.id === athlete.id ? "scale(1.02)" : "scale(1)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", margin: 0 }}>
                  {athlete.name}
                </h3>
                <p style={{ fontSize: "12px", color: "#999999", margin: "4px 0 0 0" }}>
                  {athlete.position} • {athlete.age} anos
                </p>
              </div>
              <Star style={{ color: "#CC1A1A", width: "20px" }} />
            </div>

            {/* Overall Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #CC1A1A 0%, #8B0000 100%)",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#FFFFFF" }}>
                {athlete.overall}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>
                OVERALL
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
              <div style={{ background: "#0A0A0A", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#CC1A1A" }}>
                  {athlete.nadscore}
                </div>
                <div style={{ fontSize: "10px", color: "#999999" }}>NadScore</div>
              </div>
              <div style={{ background: "#0A0A0A", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#CC1A1A" }}>
                  {athlete.presenca}%
                </div>
                <div style={{ fontSize: "10px", color: "#999999" }}>Presença</div>
              </div>
              <div style={{ background: "#0A0A0A", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#FFFFFF" }}>
                  {athlete.goals}
                </div>
                <div style={{ fontSize: "10px", color: "#999999" }}>Gols</div>
              </div>
              <div style={{ background: "#0A0A0A", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#FFFFFF" }}>
                  {athlete.assists}
                </div>
                <div style={{ fontSize: "10px", color: "#999999" }}>Assistências</div>
              </div>
            </div>

            <button
              style={{
                width: "100%",
                padding: "10px",
                background: "#CC1A1A",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 200ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#AA1515")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#CC1A1A")}
            >
              <Eye style={{ display: "inline", marginRight: "6px", width: "16px" }} />
              Ver Perfil Completo
            </button>
          </div>
        ))}
      </div>

      {/* Detailed View */}
      {selectedAthlete && (
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#FFFFFF", marginBottom: "24px" }}>
            Análise Detalhada: {selectedAthlete.name}
          </h2>

          {/* Performance Chart */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", marginBottom: "16px" }}>
              Evolução Física (medições)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="week" stroke="#666666" />
                <YAxis stroke="#666666" />
                <Tooltip contentStyle={{ background: "#0A0A0A", border: "1px solid #333333" }} />
                <Legend />
                <Line type="monotone" dataKey="velocidade" stroke="#CC1A1A" strokeWidth={2} />
                <Line type="monotone" dataKey="resistencia" stroke="#00CC00" strokeWidth={2} />
                <Line type="monotone" dataKey="vo2" stroke="#0099FF" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", marginBottom: "16px" }}>
              Avaliações (última nota de cada tipo, 0–100)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#333333" />
                <PolarAngleAxis dataKey="attribute" stroke="#666666" />
                <PolarRadiusAxis stroke="#666666" />
                <Radar name="Atributos" dataKey="value" stroke="#CC1A1A" fill="#CC1A1A" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default NadgolScout;
