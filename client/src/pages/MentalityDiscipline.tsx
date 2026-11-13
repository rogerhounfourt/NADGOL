import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loading, Empty, ErrorState } from "@/components/PageState";
import { useAthleteMetrics, useEvaluations, TIPO_AVALIACAO } from "@/lib/queries";
import { Heart, Shield, Target, Zap, TrendingUp, Award } from "lucide-react";

const MentalityDiscipline = () => {
  const q = useAthleteMetrics();
  const [atletaId, setAtletaId] = useState("");
  const lista = q.data ?? [];
  const atual = lista.find(m => m.id === atletaId) ?? lista[0];
  const av = useEvaluations(atual?.id ?? "");
  const mentais = (av.data ?? []).filter(a => a.tipo === "mentalidade" || a.tipo === "disciplina");
  const evaluations = mentais.map(a => ({
    id: a.id, date: new Date(a.data + "T12:00:00").toLocaleDateString("pt-BR"), category: TIPO_AVALIACAO[a.tipo],
    score: a.nota ?? 0, feedback: a.comentario ?? "Sem comentário.",
  }));
  const ultima = (tipo: string) => (av.data ?? []).find(a => a.tipo === tipo)?.nota ?? 0;
  const evolutionData = [...mentais].reverse().map(a => ({
    week: a.data.slice(8, 10) + "/" + a.data.slice(5, 7), [a.tipo]: a.nota,
  }));
  const indicators = [
    { label: "Disciplina", value: ultima("disciplina"), icon: <Shield className="w-5 h-5" /> },
    { label: "Mentalidade", value: ultima("mentalidade"), icon: <Heart className="w-5 h-5" /> },
    { label: "Presença", value: atual?.presenca ?? 0, icon: <Target className="w-5 h-5" /> },
    { label: "Overall", value: atual?.overall ?? 0, icon: <Zap className="w-5 h-5" /> },
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
            Mentalidade e Disciplina
          </h1>
        </div>
        <p style={{ color: "#999999", fontSize: "14px", margin: 0 }}>
          Avaliações comportamentais e evolução mental do atleta
        </p>
      </div>

      {q.isLoading && <Loading />}
      {q.isError && <ErrorState onRetry={() => q.refetch()} />}
      {q.isSuccess && lista.length === 0 && <Empty title="Nenhum atleta" hint="Cadastre atletas para ver as avaliações." />}
      {lista.length > 0 && (
        <select value={atual?.id ?? ""} onChange={e => setAtletaId(e.target.value)}
          style={{ marginBottom: "16px", padding: "8px 12px", background: "#1A1A1A", color: "#FFFFFF", border: "1px solid #333333", borderRadius: "6px" }}>
          {lista.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
      )}

      {/* Indicators */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {indicators.map((indicator, index) => (
          <div
            key={index}
            style={{
              background: "#1A1A1A",
              border: "1px solid #333333",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px", color: "#CC1A1A" }}>
              {indicator.icon}
            </div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#CC1A1A", marginBottom: "4px" }}>
              {indicator.value}%
            </div>
            <div style={{ fontSize: "12px", color: "#999999" }}>
              {indicator.label}
            </div>
          </div>
        ))}
      </div>

      {/* Evolution Chart */}
      <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "20px", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", marginBottom: "16px" }}>
          Evolução Comportamental
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolutionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
            <XAxis dataKey="week" stroke="#666666" />
            <YAxis stroke="#666666" domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "#0A0A0A", border: "1px solid #333333" }} />
            <Legend />
            <Line type="monotone" dataKey="mentalidade" stroke="#CC1A1A" strokeWidth={2} connectNulls />
            <Line type="monotone" dataKey="disciplina" stroke="#00CC00" strokeWidth={2} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Evaluations */}
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", marginBottom: "16px" }}>
          Avaliações Recentes
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {evaluations.length === 0 && <p style={{ color: "#999999", fontSize: "13px" }}>Nenhuma avaliação de mentalidade ou disciplina registrada.</p>}
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              style={{
                background: "#1A1A1A",
                border: "1px solid #333333",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#FFFFFF", margin: 0 }}>
                    {evaluation.category}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#999999", margin: "4px 0 0 0" }}>
                    {evaluation.date}
                  </p>
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: evaluation.score >= 85 ? "#00CC00" : evaluation.score >= 75 ? "#FFAA00" : "#CC1A1A",
                  }}
                >
                  {evaluation.score}
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "#CCCCCC", lineHeight: "1.5", margin: "12px 0" }}>
                {evaluation.feedback}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default MentalityDiscipline;
