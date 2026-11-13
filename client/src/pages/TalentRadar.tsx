import React, { useState } from "react";
import { Loading, Empty, ErrorState } from "@/components/PageState";
import { useAthleteMetrics } from "@/lib/queries";
import { Star, TrendingUp, Zap, Target, Award, Trophy } from "lucide-react";

interface Prospect {
  id: string;
  name: string;
  position: string;
  age: number;
  category: string;
  overall: number;
  presenca: number;
  nadscore: number | null;
  evolution: number | null;
  gols: number;
  assistencias: number;
  badge: string;
}

const TalentRadar = () => {
  const [selectedTab, setSelectedTab] = useState("prospects");

  const q = useAthleteMetrics();
  const lista = q.data ?? [];
  const score = (m: (typeof lista)[number]) => m.overall + (m.nadscore ?? 0) * 3 + (m.vo2Evolucao ?? 0) * 0.2;
  const topProspects: Prospect[] = [...lista].sort((x, y) => score(y) - score(x)).slice(0, 6).map((m, i) => ({
    id: m.id, name: m.nome, position: m.posicao, age: m.idade, category: m.categoria, overall: m.overall,
    presenca: m.presenca, nadscore: m.nadscore, evolution: m.vo2Evolucao, gols: m.gols, assistencias: m.assistencias,
    badge: i === 0 ? "🔥 Promissor" : i === 1 ? "⚡ Destaque" : "🎯 Consistente",
  }));
  const top = (f: (m: (typeof lista)[number]) => number, min = 1) => lista.filter(m => f(m) >= min).length;
  const talentCategories = [
    { id: 1, name: "Maior Evolução Física", count: top(m => m.vo2Evolucao ?? 0, 5), icon: <TrendingUp className="w-5 h-5" /> },
    { id: 2, name: "Destaque Técnico (overall ≥ 70)", count: top(m => m.overall, 70), icon: <Target className="w-5 h-5" /> },
    { id: 3, name: "Destaque Ofensivo (gols + assist.)", count: top(m => m.gols + m.assistencias, 3), icon: <Zap className="w-5 h-5" /> },
    { id: 4, name: "NadScore ≥ 7", count: top(m => m.nadscore ?? 0, 7), icon: <Award className="w-5 h-5" /> },
    { id: 5, name: "Atletas Promissores", count: Math.min(6, lista.length), icon: <Star className="w-5 h-5" /> },
    { id: 6, name: "Maior Consistência (presença ≥ 80%)", count: top(m => m.presenca, 80), icon: <Trophy className="w-5 h-5" /> },
  ];

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
            Radar de Talentos
          </h1>
        </div>
        <p style={{ color: "#999999", fontSize: "14px", margin: 0 }}>
          Sistema automático de identificação de talentos e prospectos
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid #333333", paddingBottom: "12px" }}>
        <button
          onClick={() => setSelectedTab("prospects")}
          style={{
            padding: "8px 16px",
            background: selectedTab === "prospects" ? "#CC1A1A" : "transparent",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 200ms",
          }}
        >
          Top Prospectos
        </button>
        <button
          onClick={() => setSelectedTab("categories")}
          style={{
            padding: "8px 16px",
            background: selectedTab === "categories" ? "#CC1A1A" : "transparent",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 200ms",
          }}
        >
          Categorias de Talento
        </button>
      </div>

      {/* Top Prospects */}
      {q.isLoading && <Loading />}
      {q.isError && <ErrorState onRetry={() => q.refetch()} />}
      {q.isSuccess && lista.length === 0 && <Empty title="Nenhum atleta" hint="Cadastre atletas para ver os talentos." />}
      {selectedTab === "prospects" && (
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", marginBottom: "16px" }}>
            Top 3 Prospectos Nadgol
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {topProspects.map((prospect, index) => (
              <div
                key={prospect.id}
                style={{
                  background: `linear-gradient(135deg, #1A1A1A 0%, #2A1A1A 100%)`,
                  border: "1px solid #333333",
                  borderRadius: "12px",
                  padding: "20px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Rank Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#000000",
                  }}
                >
                  {index + 1}
                </div>

                {/* Name and Position */}
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#FFFFFF", margin: "0 0 4px 0" }}>
                  {prospect.name}
                </h3>
                <p style={{ fontSize: "12px", color: "#999999", margin: "0 0 12px 0" }}>
                  {prospect.position} • {prospect.age} anos • {prospect.category}
                </p>

                {/* Badge */}
                <div style={{ marginBottom: "12px" }}>
                  <span
                    style={{
                      display: "inline-block",
                      background: "#CC1A1A",
                      color: "#FFFFFF",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}
                  >
                    {prospect.badge}
                  </span>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ background: "#0A0A0A", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#CC1A1A" }}>
                      {prospect.overall}
                    </div>
                    <div style={{ fontSize: "10px", color: "#999999" }}>Overall</div>
                  </div>
                  <div style={{ background: "#0A0A0A", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#00CC00" }}>
                      {prospect.nadscore ?? "—"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#999999" }}>NadScore</div>
                  </div>
                  <div style={{ background: "#0A0A0A", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#0099FF" }}>
                      {prospect.presenca}%
                    </div>
                    <div style={{ fontSize: "10px", color: "#999999" }}>Presença</div>
                  </div>
                  <div style={{ background: "#0A0A0A", borderRadius: "6px", padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#FFAA00" }}>
                      {prospect.evolution === null ? "—" : (prospect.evolution > 0 ? "+" : "") + prospect.evolution + "%"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#999999" }}>Evol. VO2</div>
                  </div>
                </div>

                {/* Highlights */}
                <div style={{ borderTop: "1px solid #333333", paddingTop: "12px" }}>
                  <p style={{ fontSize: "11px", color: "#999999", margin: "0 0 4px 0" }}>
                    <strong>Gols:</strong> {prospect.gols}
                  </p>
                  <p style={{ fontSize: "11px", color: "#999999", margin: 0 }}>
                    <strong>Assistências:</strong> {prospect.assistencias}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Talent Categories */}
      {selectedTab === "categories" && (
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", marginBottom: "16px" }}>
            Categorias de Talento
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {talentCategories.map((category) => (
              <div
                key={category.id}
                style={{
                  background: "#1A1A1A",
                  border: "1px solid #333333",
                  borderRadius: "12px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "all 200ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#CC1A1A";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(204, 26, 26, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#333333";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ color: "#CC1A1A", fontSize: "20px" }}>
                    {category.icon}
                  </div>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#FFFFFF", margin: 0 }}>
                    {category.name}
                  </h3>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: "12px", color: "#999999", margin: 0 }}>
                    Atletas identificados
                  </p>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#CC1A1A" }}>
                    {category.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentRadar;
