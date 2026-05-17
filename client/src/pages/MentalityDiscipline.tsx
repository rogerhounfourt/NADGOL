import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Heart, Shield, Target, Zap, TrendingUp, Award } from "lucide-react";

interface Evaluation {
  id: number;
  date: string;
  category: string;
  score: number;
  feedback: string;
  evaluator: string;
}

const MentalityDiscipline = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const evaluations: Evaluation[] = [
    {
      id: 1,
      date: "15 Mai 2024",
      category: "Foco",
      score: 8.5,
      feedback: "Excelente concentração durante os treinos. Mantém foco mesmo em situações adversas.",
      evaluator: "Treinador João",
    },
    {
      id: 2,
      date: "14 Mai 2024",
      category: "Liderança",
      score: 7.2,
      feedback: "Bom comportamento. Poderia ser mais comunicativo com os colegas.",
      evaluator: "Treinador João",
    },
    {
      id: 3,
      date: "13 Mai 2024",
      category: "Disciplina",
      score: 9.0,
      feedback: "Atleta exemplar. Respeita todas as regras e horários. Dedicado.",
      evaluator: "Coordenador",
    },
    {
      id: 4,
      date: "12 Mai 2024",
      category: "Comprometimento",
      score: 8.8,
      feedback: "Demonstra grande comprometimento com o desenvolvimento. Treina com intensidade.",
      evaluator: "Treinador João",
    },
    {
      id: 5,
      date: "11 Mai 2024",
      category: "Comportamento",
      score: 8.3,
      feedback: "Comportamento adequado. Respeita colegas e autoridades.",
      evaluator: "Coordenador",
    },
    {
      id: 6,
      date: "10 Mai 2024",
      category: "Frequência",
      score: 9.5,
      feedback: "Presença perfeita. Nunca faltou aos treinos. Muito dedicado.",
      evaluator: "Administração",
    },
  ];

  const evolutionData = [
    { week: "Sem 1", foco: 7.5, lideranca: 6.8, disciplina: 8.5, comprometimento: 8.0 },
    { week: "Sem 2", foco: 7.8, lideranca: 7.0, disciplina: 8.7, comprometimento: 8.2 },
    { week: "Sem 3", foco: 8.2, lideranca: 7.2, disciplina: 8.9, comprometimento: 8.5 },
    { week: "Sem 4", foco: 8.5, lideranca: 7.2, disciplina: 9.0, comprometimento: 8.8 },
  ];

  const indicators = [
    { label: "Disciplina Elite", value: 92, icon: <Shield className="w-5 h-5" />, color: "from-red-500 to-red-600" },
    { label: "Liderança", value: 72, icon: <Zap className="w-5 h-5" />, color: "from-blue-500 to-blue-600" },
    { label: "Consistência", value: 85, icon: <Target className="w-5 h-5" />, color: "from-green-500 to-green-600" },
    { label: "Mentalidade Forte", value: 88, icon: <Heart className="w-5 h-5" />, color: "from-purple-500 to-purple-600" },
  ];

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
            Mentalidade e Disciplina
          </h1>
        </div>
        <p style={{ color: "#999999", fontSize: "14px", margin: 0 }}>
          Avaliações comportamentais e evolução mental do atleta
        </p>
      </div>

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
            <YAxis stroke="#666666" />
            <Tooltip contentStyle={{ background: "#0A0A0A", border: "1px solid #333333" }} />
            <Legend />
            <Line type="monotone" dataKey="foco" stroke="#CC1A1A" strokeWidth={2} />
            <Line type="monotone" dataKey="lideranca" stroke="#0099FF" strokeWidth={2} />
            <Line type="monotone" dataKey="disciplina" stroke="#00CC00" strokeWidth={2} />
            <Line type="monotone" dataKey="comprometimento" stroke="#FFAA00" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Evaluations */}
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", marginBottom: "16px" }}>
          Avaliações Recentes
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
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
                    color: evaluation.score >= 8.5 ? "#00CC00" : evaluation.score >= 7.5 ? "#FFAA00" : "#CC1A1A",
                  }}
                >
                  {evaluation.score}
                </div>
              </div>
              <p style={{ fontSize: "13px", color: "#CCCCCC", lineHeight: "1.5", margin: "12px 0" }}>
                {evaluation.feedback}
              </p>
              <div style={{ fontSize: "11px", color: "#666666", paddingTop: "12px", borderTop: "1px solid #333333" }}>
                Avaliador: {evaluation.evaluator}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Self-Evaluation Section */}
      <div style={{ marginTop: "32px", background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "20px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", marginBottom: "16px" }}>
          Autoavaliação
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          {["Foco", "Liderança", "Disciplina", "Comprometimento"].map((category) => (
            <div key={category}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "#CCCCCC", display: "block", marginBottom: "8px" }}>
                {category}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                defaultValue="7"
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "3px",
                  background: "#333333",
                  outline: "none",
                  cursor: "pointer",
                }}
              />
              <div style={{ fontSize: "11px", color: "#999999", marginTop: "4px" }}>
                Sua nota: <span style={{ color: "#CC1A1A", fontWeight: "600" }}>7/10</span>
              </div>
            </div>
          ))}
        </div>
        <button
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "12px",
            background: "#CC1A1A",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background 200ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#AA1515")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#CC1A1A")}
        >
          Enviar Autoavaliação
        </button>
      </div>
    </div>
  );
};

export default MentalityDiscipline;
