import React, { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import FormModal from "@/components/FormModal";
import { Loading, Empty, ErrorState } from "@/components/PageState";
import { useAthletes, useJourney, useCreateJourneyEvent, type TipoJornada } from "@/lib/queries";
import { Trophy, Zap, TrendingUp, Award, Calendar } from "lucide-react";

interface JourneyEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "milestone" | "achievement" | "competition" | "improvement" | "award";
  icon: React.ReactNode;
  color: string;
}

const TIPO_UI: Record<TipoJornada, { type: JourneyEvent["type"]; icon: React.ReactNode; color: string }> = {
  marco: { type: "milestone", icon: <Calendar className="w-5 h-5" />, color: "from-blue-500 to-blue-600" },
  competicao: { type: "competition", icon: <Trophy className="w-5 h-5" />, color: "from-yellow-500 to-yellow-600" },
  conquista: { type: "achievement", icon: <Zap className="w-5 h-5" />, color: "from-red-500 to-red-600" },
  premiacao: { type: "award", icon: <Award className="w-5 h-5" />, color: "from-orange-500 to-orange-600" },
  evolucao: { type: "improvement", icon: <TrendingUp className="w-5 h-5" />, color: "from-green-500 to-green-600" },
};
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const dataBonita = (d: string) => `${d.slice(8, 10)} ${MESES[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;

const AthleteJourney = () => {
  const { currentUser, demo } = useApp();
  const atl = useAthletes();
  const lista = (atl.data ?? []).filter(a => a.status === "active");
  const [atletaId, setAtletaId] = useState("");
  const [novo, setNovo] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<JourneyEvent | null>(null);
  useEffect(() => {
    if (atletaId || lista.length === 0) return;
    setAtletaId(lista.find(a => a.id === currentUser?.atletaId)?.id ?? lista[0].id);
  }, [lista, atletaId, currentUser?.atletaId]);
  const q = useJourney(atletaId);
  const criar = useCreateJourneyEvent();
  const podeEditar = demo || currentUser?.role === "admin" || currentUser?.role === "coach";
  const atleta = lista.find(a => a.id === atletaId);

  const journeyEvents: JourneyEvent[] = (q.data ?? []).map(e => ({
    id: e.id, date: dataBonita(e.data), title: e.titulo, description: e.descricao, ...TIPO_UI[e.tipo],
  }));
  const primeira = (q.data ?? [])[0]?.data;
  const meses = primeira ? Math.max(1, Math.round((Date.now() - new Date(`${primeira}T12:00:00`).getTime()) / (30 * 864e5))) : 0;

  if (atl.isLoading) return <Loading />;
  if (atl.isError) return <ErrorState onRetry={() => atl.refetch()} />;
  if (lista.length === 0) return <Empty title="Nenhum atleta" hint="Cadastre atletas para montar a jornada." />;

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
            Jornada do Atleta
          </h1>
        </div>
        <p style={{ color: "#999999", fontSize: "14px", margin: 0 }}>
          Acompanhe toda a evolução e histórico do atleta na Nadgol Academy
        </p>
        <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
          {lista.length > 1 && (
            <select value={atletaId} onChange={e => setAtletaId(e.target.value)} style={{ padding: "8px 12px", background: "#111", border: "1px solid #2A2A2A", borderRadius: "6px", color: "#fff", fontSize: "12px" }}>
              {lista.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          )}
          {podeEditar && <button onClick={() => setNovo(true)} className="nadgol-btn-primary" style={{ padding: "8px 14px", borderRadius: "6px", fontSize: "12px", border: "none", cursor: "pointer" }}>+ Novo evento</button>}
        </div>
      </div>

      {q.isLoading ? <Loading /> : q.isError ? <ErrorState onRetry={() => q.refetch()} /> : journeyEvents.length === 0 && <Empty title="Jornada em branco" hint="Adicione os primeiros marcos do atleta." />}

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {/* Center line */}
        <div
          style={{
            position: "absolute",
            left: "24px",
            top: 0,
            bottom: 0,
            width: "2px",
            background: "linear-gradient(180deg, #CC1A1A 0%, #1A1A1A 100%)",
          }}
        />

        {/* Events */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {journeyEvents.map((event, index) => (
            <div
              key={event.id}
              style={{
                display: "flex",
                gap: "24px",
                cursor: "pointer",
                opacity: selectedEvent?.id === event.id ? 1 : 0.7,
                transition: "opacity 200ms",
              }}
              onClick={() => setSelectedEvent(event)}
            >
              {/* Timeline dot */}
              <div
                style={{
                  position: "relative",
                  width: "50px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  paddingTop: "8px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${event.color.split(" ")[1]} 0%, ${event.color.split(" ")[3]} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    boxShadow: "0 0 20px rgba(204, 26, 26, 0.4)",
                    border: "2px solid #1A1A1A",
                  }}
                >
                  {event.icon}
                </div>
              </div>

              {/* Event card */}
              <div
                style={{
                  flex: 1,
                  background: "#1A1A1A",
                  border: selectedEvent?.id === event.id ? "2px solid #CC1A1A" : "1px solid #333333",
                  borderRadius: "12px",
                  padding: "16px",
                  transition: "all 200ms",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", margin: 0 }}>
                    {event.title}
                  </h3>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#999999",
                      background: "#0A0A0A",
                      padding: "4px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    {event.date}
                  </span>
                </div>
                <p style={{ fontSize: "14px", color: "#CCCCCC", margin: 0 }}>
                  {event.description}
                </p>
                <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      background: "#CC1A1A",
                      color: "#FFFFFF",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                      fontWeight: "600",
                    }}
                  >
                    {event.type === "milestone" && "Marco"}
                    {event.type === "achievement" && "Conquista"}
                    {event.type === "competition" && "Competição"}
                    {event.type === "improvement" && "Evolução"}
                    {event.type === "award" && "Premiação"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginTop: "48px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#CC1A1A", marginBottom: "4px" }}>
            {journeyEvents.length}
          </div>
          <div style={{ fontSize: "14px", color: "#999999" }}>
            Eventos Registrados
          </div>
        </div>
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#CC1A1A", marginBottom: "4px" }}>
            {meses} {meses === 1 ? "mês" : "meses"}
          </div>
          <div style={{ fontSize: "14px", color: "#999999" }}>
            Desde o 1º evento
          </div>
        </div>
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#CC1A1A", marginBottom: "4px" }}>
            {atleta?.goals ?? 0} {(atleta?.goals ?? 0) === 1 ? "gol" : "gols"}
          </div>
          <div style={{ fontSize: "14px", color: "#999999" }}>
            Marcados
          </div>
        </div>
      </div>

      {novo && atleta && (
        <FormModal
          title={`Novo evento · ${atleta.name.split(" ")[0]}`} submitLabel="Adicionar" saving={criar.isPending}
          fields={[
            { name: "titulo", label: "Título", required: true, placeholder: "Ex.: Primeiro gol" },
            { name: "tipo", label: "Tipo", type: "select", required: true, half: true, options: [
              { value: "marco", label: "Marco" }, { value: "conquista", label: "Conquista" }, { value: "competicao", label: "Competição" },
              { value: "evolucao", label: "Evolução" }, { value: "premiacao", label: "Premiação" } ] },
            { name: "data", label: "Data", type: "date", required: true, half: true },
            { name: "descricao", label: "Descrição (opcional)" },
          ]}
          onSubmit={v => criar.mutate({ atletaId: atleta.id, data: v.data, tipo: v.tipo as TipoJornada, titulo: v.titulo, descricao: v.descricao }, { onSuccess: () => setNovo(false) })}
          onClose={() => setNovo(false)}
        />
      )}
    </div>
  );
};

export default AthleteJourney;
