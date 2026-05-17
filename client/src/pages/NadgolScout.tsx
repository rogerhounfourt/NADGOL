import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Search, Filter, Download, Eye, Star } from "lucide-react";

interface Athlete {
  id: number;
  name: string;
  position: string;
  age: number;
  height: string;
  weight: string;
  nadscore: number;
  potential: number;
  overall: number;
  competitions: number;
  goals: number;
  assists: number;
  image?: string;
}

const NadgolScout = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [filterPosition, setFilterPosition] = useState("all");

  const athletes: Athlete[] = [
    {
      id: 1,
      name: "João Silva",
      position: "Atacante",
      age: 14,
      height: "1.78m",
      weight: "72kg",
      nadscore: 8.2,
      potential: 9.1,
      overall: 78,
      competitions: 12,
      goals: 8,
      assists: 3,
    },
    {
      id: 2,
      name: "Carlos Santos",
      position: "Meia",
      age: 15,
      height: "1.75m",
      weight: "68kg",
      nadscore: 7.9,
      potential: 8.8,
      overall: 76,
      competitions: 14,
      goals: 2,
      assists: 7,
    },
    {
      id: 3,
      name: "Lucas Oliveira",
      position: "Zagueiro",
      age: 16,
      height: "1.85m",
      weight: "78kg",
      nadscore: 7.6,
      potential: 8.5,
      overall: 74,
      competitions: 15,
      goals: 1,
      assists: 0,
    },
  ];

  const performanceData = [
    { week: "Sem 1", velocidade: 28, resistencia: 75, tecnica: 82 },
    { week: "Sem 2", velocidade: 29, resistencia: 78, tecnica: 84 },
    { week: "Sem 3", velocidade: 30, resistencia: 80, tecnica: 85 },
    { week: "Sem 4", velocidade: 31, resistencia: 82, tecnica: 87 },
  ];

  const radarData = [
    { attribute: "Velocidade", value: 85 },
    { attribute: "Resistência", value: 82 },
    { attribute: "Técnica", value: 87 },
    { attribute: "Força", value: 78 },
    { attribute: "Inteligência", value: 80 },
    { attribute: "Liderança", value: 75 },
  ];

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
            src="https://manus-storage.s3.us-west-2.amazonaws.com/nadgol-shield.jpg"
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
          <option value="Atacante">Atacante</option>
          <option value="Meia">Meia</option>
          <option value="Zagueiro">Zagueiro</option>
        </select>
      </div>

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
                  {athlete.potential}
                </div>
                <div style={{ fontSize: "10px", color: "#999999" }}>Potencial</div>
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
              Evolução de Performance
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
                <Line type="monotone" dataKey="tecnica" stroke="#0099FF" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", marginBottom: "16px" }}>
              Mapa de Atributos
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
