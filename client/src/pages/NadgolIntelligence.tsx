import React, { useState } from "react";
import { Loading, Empty, ErrorState } from "@/components/PageState";
import { useAthleteMetrics, usePhysicalEvals, useDailyLogs, useMatchLog } from "@/lib/queries";
import { Brain, TrendingUp, AlertCircle, CheckCircle, Zap, Target } from "lucide-react";

interface Insight {
  id: number;
  category: string;
  message: string;
  type: "warning" | "success" | "info" | "improvement";
  icon: React.ReactNode;
  color: string;
}

const NadgolIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const q = useAthleteMetrics();
  const [atletaId, setAtletaId] = useState("");
  const lista = q.data ?? [];
  const atual = lista.find(m => m.id === atletaId) ?? lista[0];
  const fis = usePhysicalEvals(atual?.id ?? "");
  const diario = useDailyLogs(atual?.id ?? "");
  const jogos = useMatchLog(atual?.id ?? "");

  const insights: Insight[] = [];
  const add = (category: string, message: string, type: Insight["type"]) => {
    const cfg = {
      warning: { icon: <AlertCircle className="w-5 h-5" />, color: "from-yellow-500 to-yellow-600" },
      info: { icon: <Target className="w-5 h-5" />, color: "from-blue-500 to-blue-600" },
      success: { icon: <CheckCircle className="w-5 h-5" />, color: "from-green-500 to-green-600" },
      improvement: { icon: <TrendingUp className="w-5 h-5" />, color: "from-purple-500 to-purple-600" },
    }[type];
    insights.push({ id: insights.length + 1, category, message, type, ...cfg });
  };
  if (atual) {
    const medias = (xs: (number | null)[]) => { const v = xs.filter((x): x is number => x !== null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const f = fis.data ?? [];
    const vel = f.filter(x => x.velocidade !== null);
    if (vel.length >= 2) {
      const ant = vel[vel.length - 2].velocidade!, nov = vel[vel.length - 1].velocidade!;
      if (nov > ant) add("Velocidade", `Evolução em velocidade de pico: marca anterior ${ant} km/h, agora ${nov} km/h.`, "success");
      else if (nov < ant) add("Velocidade", `Velocidade de pico caiu de ${ant} para ${nov} km/h na última medição.`, "warning");
    }
    if (atual.vo2Evolucao !== null) add("Condicionamento", `VO2 variou ${atual.vo2Evolucao > 0 ? "+" : ""}${atual.vo2Evolucao}% entre a primeira e a última medição.`, atual.vo2Evolucao >= 0 ? "improvement" : "warning");
    const d = diario.data ?? [];
    const sono = medias(d.map(x => x.sono)), agua = medias(d.map(x => x.agua)), tela = medias(d.map(x => x.tela));
    if (sono !== null) add("Recuperação", sono < 8 ? `Média de sono de ${sono.toFixed(1)}h nos últimos dias: abaixo do ideal para a idade. Priorize o descanso.` : `Boa média de sono (${sono.toFixed(1)}h). Continue assim.`, sono < 8 ? "warning" : "success");
    if (agua !== null && agua < 2) add("Hidratação", `Média de ${agua.toFixed(1)} L de água por dia. Recomendamos aumentar a hidratação.`, "warning");
    if (tela !== null && tela > 4) add("Rotina", `Média de ${tela.toFixed(1)}h de tela por dia, o que pode afetar o sono e o foco.`, "info");
    const j = jogos.data ?? [];
    if (j.length) {
      const gols = j.reduce((a, x) => a + x.gols, 0);
      add("Ofensiva", `${gols} gol(s) em ${j.length} partida(s) registradas.`, gols > 0 ? "success" : "info");
    }
    if (atual.presenca < 75) add("Presença", `Presença de ${atual.presenca}%: abaixo da meta de 75%.`, "warning");
    else add("Presença", `Presença de ${atual.presenca}%: dentro da meta.`, "success");
  }

  const filteredInsights = selectedCategory === "all" 
    ? insights 
    : insights.filter(i => i.category === selectedCategory);

  const uniqueCategories = Array.from(new Set(insights.map(i => i.category)));
  const categories = ["all", ...uniqueCategories];

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
            Nadgol Intelligence
          </h1>
        </div>
        <p style={{ color: "#999999", fontSize: "14px", margin: 0 }}>
          Análise inteligente de dados esportivos com sugestões automáticas
        </p>
      </div>

      {q.isLoading && <Loading />}
      {q.isError && <ErrorState onRetry={() => q.refetch()} />}
      {q.isSuccess && lista.length === 0 && <Empty title="Nenhum atleta" hint="Cadastre atletas para gerar insights." />}
      {lista.length > 0 && (
        <select value={atual?.id ?? ""} onChange={e => setAtletaId(e.target.value)}
          style={{ marginBottom: "16px", padding: "8px 12px", background: "#1A1A1A", color: "#FFFFFF", border: "1px solid #333333", borderRadius: "6px" }}>
          {lista.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
      )}

      {/* AI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#CC1A1A", marginBottom: "4px" }}>
            {insights.length}
          </div>
          <div style={{ fontSize: "14px", color: "#999999" }}>
            Insights Ativos
          </div>
        </div>
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#00CC00", marginBottom: "4px" }}>
            {insights.filter(i => i.type === "success" || i.type === "improvement").length}
          </div>
          <div style={{ fontSize: "14px", color: "#999999" }}>
            Melhorias Detectadas
          </div>
        </div>
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#FFAA00", marginBottom: "4px" }}>
            {insights.filter(i => i.type === "warning").length}
          </div>
          <div style={{ fontSize: "14px", color: "#999999" }}>
            Alerta Importante
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: "8px 16px",
              background: selectedCategory === category ? "#CC1A1A" : "#1A1A1A",
              color: "#FFFFFF",
              border: selectedCategory === category ? "1px solid #CC1A1A" : "1px solid #333333",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 200ms",
              textTransform: "capitalize",
            }}
          >
            {category === "all" ? "Todos" : category}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "16px" }}>
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            style={{
              background: "#1A1A1A",
              border: "1px solid #333333",
              borderRadius: "12px",
              padding: "20px",
              borderLeft: `4px solid ${
                insight.type === "warning" ? "#FFAA00" :
                insight.type === "success" ? "#00CC00" :
                insight.type === "improvement" ? "#0099FF" :
                "#666666"
              }`,
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
            {/* Icon and Category */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  background: `linear-gradient(135deg, ${
                    insight.type === "warning" ? "#FFAA00" :
                    insight.type === "success" ? "#00CC00" :
                    insight.type === "improvement" ? "#0099FF" :
                    "#666666"
                  }22 0%, transparent 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: insight.type === "warning" ? "#FFAA00" :
                    insight.type === "success" ? "#00CC00" :
                    insight.type === "improvement" ? "#0099FF" :
                    "#666666",
                }}
              >
                {insight.icon}
              </div>
              <div>
                <h3 style={{ fontSize: "12px", fontWeight: "600", color: "#999999", margin: 0, textTransform: "uppercase" }}>
                  {insight.category}
                </h3>
                <p style={{ fontSize: "11px", color: "#666666", margin: "2px 0 0 0" }}>
                  {insight.type === "warning" && "⚠️ Alerta"}
                  {insight.type === "success" && "✅ Sucesso"}
                  {insight.type === "improvement" && "📈 Melhoria"}
                  {insight.type === "info" && "ℹ️ Informação"}
                </p>
              </div>
            </div>

            {/* Message */}
            <p style={{ fontSize: "14px", color: "#CCCCCC", lineHeight: "1.5", margin: 0 }}>
              {insight.message}
            </p>

            {/* Action Button */}
            <button
              style={{
                marginTop: "12px",
                width: "100%",
                padding: "8px",
                background: "transparent",
                border: "1px solid #333333",
                borderRadius: "6px",
                color: "#CCCCCC",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 200ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#CC1A1A";
                e.currentTarget.style.color = "#CC1A1A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#333333";
                e.currentTarget.style.color = "#CCCCCC";
              }}
            >
              Saiba Mais
            </button>
          </div>
        ))}
      </div>

      {/* AI Explanation */}
      <div style={{ marginTop: "32px", background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <Brain style={{ color: "#CC1A1A", width: "24px", height: "24px", marginTop: "4px", flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", margin: "0 0 8px 0" }}>
              Como funciona a Nadgol Intelligence?
            </h3>
            <p style={{ fontSize: "14px", color: "#CCCCCC", lineHeight: "1.6", margin: 0 }}>
              Nossa IA esportiva analisa dados de desempenho, NadScore, mapas de calor, estatísticas físicas e histórico de competições para gerar insights automáticos. O sistema detecta padrões, tendências e oportunidades de melhoria, fornecendo recomendações personalizadas para cada atleta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NadgolIntelligence;
