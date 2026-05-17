import React, { useState } from "react";
import { Trophy, Zap, Target, Heart, TrendingUp, Award, Star, Calendar } from "lucide-react";

interface JourneyEvent {
  id: number;
  date: string;
  title: string;
  description: string;
  type: "milestone" | "achievement" | "competition" | "improvement" | "award";
  icon: React.ReactNode;
  color: string;
}

const AthleteJourney = () => {
  const [selectedEvent, setSelectedEvent] = useState<JourneyEvent | null>(null);

  const journeyEvents: JourneyEvent[] = [
    {
      id: 1,
      date: "15 Jan 2024",
      title: "Primeiro Treino",
      description: "Início da jornada na Nadgol Academy",
      type: "milestone",
      icon: <Calendar className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: 2,
      date: "02 Fev 2024",
      title: "Primeira Competição",
      description: "Estreia em competição oficial",
      type: "competition",
      icon: <Trophy className="w-5 h-5" />,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      id: 3,
      date: "14 Fev 2024",
      title: "Primeiro Gol",
      description: "Marcou seu primeiro gol em competição",
      type: "achievement",
      icon: <Zap className="w-5 h-5" />,
      color: "from-red-500 to-red-600",
    },
    {
      id: 4,
      date: "28 Fev 2024",
      title: "Destaque da Semana",
      description: "Eleito destaque da semana pelos treinadores",
      type: "award",
      icon: <Star className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: 5,
      date: "15 Mar 2024",
      title: "Evolução Física",
      description: "Melhora de 12% em velocidade e resistência",
      type: "improvement",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-green-500 to-green-600",
    },
    {
      id: 6,
      date: "01 Abr 2024",
      title: "Evolução Técnica",
      description: "Melhora significativa em controle de bola e passe",
      type: "improvement",
      icon: <Target className="w-5 h-5" />,
      color: "from-cyan-500 to-cyan-600",
    },
    {
      id: 7,
      date: "20 Abr 2024",
      title: "Premiação",
      description: "Recebeu prêmio de melhor atleta do mês",
      type: "award",
      icon: <Award className="w-5 h-5" />,
      color: "from-orange-500 to-orange-600",
    },
    {
      id: 8,
      date: "10 Mai 2024",
      title: "Conquista: 30 Treinos Seguidos",
      description: "Atingiu marca de 30 treinos consecutivos",
      type: "achievement",
      icon: <Heart className="w-5 h-5" />,
      color: "from-pink-500 to-pink-600",
    },
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
            Jornada do Atleta
          </h1>
        </div>
        <p style={{ color: "#999999", fontSize: "14px", margin: 0 }}>
          Acompanhe toda a evolução e histórico do atleta na Nadgol Academy
        </p>
      </div>

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
            8
          </div>
          <div style={{ fontSize: "14px", color: "#999999" }}>
            Eventos Registrados
          </div>
        </div>
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#CC1A1A", marginBottom: "4px" }}>
            4 meses
          </div>
          <div style={{ fontSize: "14px", color: "#999999" }}>
            Na Academia
          </div>
        </div>
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: "700", color: "#CC1A1A", marginBottom: "4px" }}>
            3 gols
          </div>
          <div style={{ fontSize: "14px", color: "#999999" }}>
            Marcados
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteJourney;
