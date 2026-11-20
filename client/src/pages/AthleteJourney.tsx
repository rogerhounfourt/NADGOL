import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { reduzirEscudo } from "@/lib/foto";
import { useApp } from "@/contexts/AppContext";
import FormModal from "@/components/FormModal";
import { Loading, Empty, ErrorState } from "@/components/PageState";
import { useAthletes, useJourney, useCreateJourneyEvent, type TipoJornada, type Vinculo } from "@/lib/queries";
import { Trophy, Zap, TrendingUp, Award, Calendar, Shield } from "lucide-react";

interface JourneyEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "milestone" | "achievement" | "competition" | "improvement" | "award" | "club";
  tempo?: string;
  vinculo?: Vinculo;
  linha?: string;
  escudo?: string;
  icon: React.ReactNode;
  color: string;
}

const TIPO_UI: Record<TipoJornada, { type: JourneyEvent["type"]; icon: React.ReactNode; color: string }> = {
  marco: { type: "milestone", icon: <Calendar className="w-5 h-5" />, color: "from-blue-500 to-blue-600" },
  competicao: { type: "competition", icon: <Trophy className="w-5 h-5" />, color: "from-yellow-500 to-yellow-600" },
  conquista: { type: "achievement", icon: <Zap className="w-5 h-5" />, color: "from-red-500 to-red-600" },
  premiacao: { type: "award", icon: <Award className="w-5 h-5" />, color: "from-orange-500 to-orange-600" },
  clube: { type: "club", icon: <Shield className="w-5 h-5" />, color: "from-purple-500 to-purple-600" },
  evolucao: { type: "improvement", icon: <TrendingUp className="w-5 h-5" />, color: "from-green-500 to-green-600" },
};
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const dataBonita = (d: string) => `${d.slice(8, 10)} ${MESES[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;

const MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const dia = (d: string) => `${Number(d.slice(8, 10))} de ${MES[Number(d.slice(5, 7)) - 1]}`;
const mes = (d: string) => MES[Number(d.slice(5, 7)) - 1];
/** "temporada de março a dezembro de 2026" · "teste de 22 de março a 28 de março de 2026" */
function periodo(v: Vinculo | undefined, ini: string, fim?: string) {
  const porMes = v === "temporada";
  const rotulo = v === "temporada" ? "temporada" : v === "aprovado" ? "aprovado" : "teste";
  const ai = ini.slice(0, 4), af = fim?.slice(0, 4);
  if (!fim) return `${rotulo} ${porMes ? `desde ${mes(ini)} de ${ai} (em andamento)` : `a partir de ${dia(ini)} de ${ai}`}`;
  if (ai === af) return `${rotulo} de ${porMes ? mes(ini) : dia(ini)} a ${porMes ? mes(fim) : dia(fim)} de ${ai}`;
  return `${rotulo} de ${porMes ? `${mes(ini)} de ${ai}` : `${dia(ini)} de ${ai}`} a ${porMes ? `${mes(fim)} de ${af}` : `${dia(fim)} de ${af}`}`;
}

function EscudoPicker({ value, onChange }: { value: Blob | null; onChange: (b: Blob | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const url = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  async function escolher(f?: File) {
    if (!f) return;
    setBusy(true);
    try { onChange(await reduzirEscudo(f)); } catch (e) { toast.error(e instanceof Error ? e.message : "Não foi possível usar essa imagem."); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }
  const btn: React.CSSProperties = { padding: "8px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: "1px solid #2A2A2A", background: "#1A1A1A", color: "#fff" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 64, height: 64, borderRadius: 10, background: "#111", border: "1px solid #2A2A2A", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 28 }}>
        {url ? <img src={url} alt="Escudo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} /> : "🛡️"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" disabled={busy} onClick={() => input.current?.click()} style={{ ...btn, borderColor: "#CC1A1A" }}>{busy ? "Preparando…" : value ? "Trocar escudo" : "Adicionar escudo do clube"}</button>
          {value && <button type="button" onClick={() => onChange(null)} style={btn}>Remover</button>}
        </div>
        <span style={{ fontSize: 11, color: "#888" }}>Opcional. Use o escudo em PNG ou JPG (de preferência com fundo transparente).</span>
      </div>
      <input ref={input} type="file" accept="image/*" hidden onChange={e => escolher(e.target.files?.[0])} />
    </div>
  );
}

const AthleteJourney = () => {
  const { currentUser, demo } = useApp();
  const atl = useAthletes();
  const lista = (atl.data ?? []).filter(a => a.status === "active");
  const [atletaId, setAtletaId] = useState("");
  const [novo, setNovo] = useState(false);
  const [novoClube, setNovoClube] = useState(false);
  const [escudo, setEscudo] = useState<Blob | null>(null);
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
    id: e.id, date: dataBonita(e.data), title: e.titulo, description: e.descricao, tempo: e.tempo, vinculo: e.vinculo, escudo: e.escudo, linha: e.tipo === "clube" ? `${e.titulo} ${periodo(e.vinculo, e.data, e.dataFim)}` : undefined, ...TIPO_UI[e.tipo],
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
          {podeEditar && <button onClick={() => setNovoClube(true)} style={{ padding: "8px 14px", borderRadius: "6px", fontSize: "12px", border: "1px solid #CC1A1A", background: "transparent", color: "#fff", cursor: "pointer" }}>+ Passagem por clube</button>}
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
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                    {event.type === "club" && (event.escudo
                      ? <img src={event.escudo} alt="" style={{ width: 36, height: 36, objectFit: "contain" }} />
                      : <span style={{ fontSize: 22 }}>🛡️</span>)}
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
                {event.linha && <p style={{ fontSize: "14px", color: "#fff", margin: "0 0 4px", fontWeight: 600 }}>{event.linha}</p>}
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
                    {event.type === "club" && "Clube"}
                  </span>
                  {event.vinculo && <span style={{ fontSize: "11px", background: "#2A2A2A", color: "#fff", padding: "4px 8px", borderRadius: "4px", textTransform: "uppercase", fontWeight: 600 }}>{event.vinculo === "teste" ? "Teste" : event.vinculo === "aprovado" ? "Aprovado" : "Temporada"}</span>}
                  {event.tempo && !event.linha?.includes(" de ") && <span style={{ fontSize: "11px", background: "#2A2A2A", color: "#ccc", padding: "4px 8px", borderRadius: "4px", fontWeight: 600 }}>⏱ {event.tempo}</span>}
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

      {novoClube && atleta && (
        <FormModal
          title={`Passagem por clube · ${atleta.name.split(" ")[0]}`} submitLabel="Adicionar" saving={criar.isPending}
          topSlot={<EscudoPicker value={escudo} onChange={setEscudo} />}
          fields={[
            { name: "clube", label: "Clube", required: true, placeholder: "Ex.: Flamengo, Bahia, Vitória" },
            { name: "vinculo", label: "Situação", type: "select", required: true, options: [
              { value: "teste", label: "Teste" }, { value: "aprovado", label: "Aprovado no teste" }, { value: "temporada", label: "Temporada" } ] },
            { name: "data", label: "Início", type: "date", required: true, half: true },
            { name: "dataFim", label: "Fim (vazio = em andamento)", type: "date", half: true },
            { name: "descricao", label: "Observações (opcional)", type: "textarea" },
          ]}
          onSubmit={v => {
            if (v.dataFim && v.dataFim < v.data) { toast.error("A data de fim não pode ser antes do início."); return; }
            criar.mutate({ atletaId: atleta.id, data: v.data, dataFim: v.dataFim || undefined, tipo: "clube", titulo: v.clube, clube: v.clube, vinculo: v.vinculo as Vinculo, escudo: escudo ?? undefined, descricao: v.descricao }, { onSuccess: () => { setNovoClube(false); setEscudo(null); } });
          }}
          onClose={() => { setNovoClube(false); setEscudo(null); }}
        />
      )}

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
