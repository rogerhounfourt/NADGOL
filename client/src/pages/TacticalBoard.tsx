import React, { useState } from "react";
import { Plus, Save, RotateCcw, Copy, Trash2, Play } from "lucide-react";

interface Player {
  id: number;
  number: number;
  name: string;
  position: string;
  x: number;
  y: number;
  team: "home" | "away";
}

interface Formation {
  name: string;
  positions: { position: string; x: number; y: number }[];
}

const TacticalBoard = () => {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, number: 1, name: "Goleiro", position: "GK", x: 10, y: 50, team: "home" },
    { id: 2, number: 4, name: "Defensor", position: "CB", x: 25, y: 30, team: "home" },
    { id: 3, number: 5, name: "Defensor", position: "CB", x: 25, y: 70, team: "home" },
    { id: 4, number: 3, name: "Lateral", position: "LB", x: 35, y: 80, team: "home" },
    { id: 5, number: 2, name: "Lateral", position: "RB", x: 35, y: 20, team: "home" },
    { id: 6, number: 6, name: "Volante", position: "CM", x: 50, y: 50, team: "home" },
    { id: 7, number: 8, name: "Meia", position: "CM", x: 60, y: 35, team: "home" },
    { id: 8, number: 7, name: "Meia", position: "CM", x: 60, y: 65, team: "home" },
    { id: 9, number: 10, name: "Atacante", position: "ST", x: 80, y: 50, team: "home" },
  ]);

  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [selectedFormation, setSelectedFormation] = useState("4-3-3");
  const [teamColor, setTeamColor] = useState("red");
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [draggingPlayer, setDraggingPlayer] = useState<number | null>(null);

  const formations: Record<string, Formation> = {
    "4-3-3": {
      name: "4-3-3",
      positions: [
        { position: "GK", x: 10, y: 50 },
        { position: "RB", x: 25, y: 20 },
        { position: "CB", x: 25, y: 40 },
        { position: "CB", x: 25, y: 60 },
        { position: "LB", x: 25, y: 80 },
        { position: "CM", x: 45, y: 30 },
        { position: "CM", x: 45, y: 50 },
        { position: "CM", x: 45, y: 70 },
        { position: "RW", x: 70, y: 25 },
        { position: "ST", x: 80, y: 50 },
        { position: "LW", x: 70, y: 75 },
      ],
    },
    "4-4-2": {
      name: "4-4-2",
      positions: [
        { position: "GK", x: 10, y: 50 },
        { position: "RB", x: 25, y: 20 },
        { position: "CB", x: 25, y: 40 },
        { position: "CB", x: 25, y: 60 },
        { position: "LB", x: 25, y: 80 },
        { position: "RM", x: 50, y: 25 },
        { position: "CM", x: 50, y: 40 },
        { position: "CM", x: 50, y: 60 },
        { position: "LM", x: 50, y: 75 },
        { position: "ST", x: 75, y: 40 },
        { position: "ST", x: 75, y: 60 },
      ],
    },
    "4-2-3-1": {
      name: "4-2-3-1",
      positions: [
        { position: "GK", x: 10, y: 50 },
        { position: "RB", x: 25, y: 20 },
        { position: "CB", x: 25, y: 40 },
        { position: "CB", x: 25, y: 60 },
        { position: "LB", x: 25, y: 80 },
        { position: "DM", x: 40, y: 35 },
        { position: "DM", x: 40, y: 65 },
        { position: "RM", x: 60, y: 20 },
        { position: "CM", x: 60, y: 50 },
        { position: "LM", x: 60, y: 80 },
        { position: "ST", x: 80, y: 50 },
      ],
    },
  };

  const handleFormationChange = (formationName: string) => {
    setSelectedFormation(formationName);
    const formation = formations[formationName];
    if (formation) {
      const newPlayers = formation.positions.map((pos, idx) => ({
        id: idx + 1,
        number: idx + 1,
        name: pos.position,
        position: pos.position,
        x: pos.x,
        y: pos.y,
        team: "home" as const,
      }));
      setPlayers(newPlayers);
    }
  };

  const handlePlayerDrag = (e: React.MouseEvent, playerId: number) => {
    const field = document.getElementById("tactical-field");
    if (!field) return;

    const rect = field.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const player = players.find(p => p.id === playerId);
      if (!player) return;

      const newX = Math.max(5, Math.min(95, player.x + (deltaX / rect.width) * 100));
      const newY = Math.max(5, Math.min(95, player.y + (deltaY / rect.height) * 100));

      setPlayers(players.map(p =>
        p.id === playerId ? { ...p, x: newX, y: newY } : p
      ));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div style={{ padding: "24px", background: "#0A0A0A", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <img
            src="https://manus-storage.s3.us-west-2.amazonaws.com/nadgol-shield.jpg"
            alt="Nadgol Shield"
            style={{ width: "32px", height: "32px" }}
          />
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#FFFFFF", margin: 0 }}>
            Nadgol Tactical Board
          </h1>
        </div>
        <p style={{ color: "#999999", fontSize: "14px", margin: 0 }}>
          Central tática profissional para escalações e estratégias
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {/* Formation Selector */}
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "#999999", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Formação
          </label>
          <select
            value={selectedFormation}
            onChange={(e) => handleFormationChange(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              background: "#0A0A0A",
              border: "1px solid #333333",
              borderRadius: "6px",
              color: "#FFFFFF",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            <option value="4-3-3">4-3-3</option>
            <option value="4-4-2">4-4-2</option>
            <option value="4-2-3-1">4-2-3-1</option>
          </select>
        </div>

        {/* Team Color */}
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "#999999", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
            Cor da Equipe
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            {["red", "black"].map((color) => (
              <button
                key={color}
                onClick={() => setTeamColor(color)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: color === "red" ? "#CC1A1A" : "#1A1A1A",
                  border: color === teamColor ? "2px solid #FFFFFF" : "1px solid #333333",
                  borderRadius: "6px",
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {color === "red" ? "🔴 Vermelho" : "⚫ Preto"}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowPlaybook(!showPlaybook)}
            style={{
              flex: 1,
              padding: "10px",
              background: "#CC1A1A",
              border: "1px solid #CC1A1A",
              borderRadius: "6px",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Play style={{ width: "16px", height: "16px" }} />
            Jogadas
          </button>
          <button
            style={{
              flex: 1,
              padding: "10px",
              background: "transparent",
              border: "1px solid #333333",
              borderRadius: "6px",
              color: "#CCCCCC",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Save style={{ width: "16px", height: "16px" }} />
            Salvar
          </button>
        </div>
      </div>

      {/* Tactical Field */}
      <div
        id="tactical-field"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 10",
          background: "linear-gradient(135deg, #1A4D2E 0%, #0F3D1F 100%)",
          border: "2px solid #FFFFFF",
          borderRadius: "12px",
          marginBottom: "24px",
          overflow: "hidden",
        }}
      >
        {/* Field Lines */}
        <svg
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        >
          {/* Center Line */}
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#FFFFFF" strokeWidth="2" />
          {/* Center Circle */}
          <circle cx="50%" cy="50%" r="15%" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          {/* Penalty Areas */}
          <rect x="0%" y="17%" width="16%" height="66%" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          <rect x="84%" y="17%" width="16%" height="66%" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          {/* Goal Areas */}
          <rect x="0%" y="32%" width="5%" height="36%" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          <rect x="95%" y="32%" width="5%" height="36%" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        </svg>

        {/* Players */}
        {players.map((player) => (
          <div
            key={player.id}
            onMouseDown={(e) => handlePlayerDrag(e, player.id)}
            onClick={() => setSelectedPlayer(player.id)}
            style={{
              position: "absolute",
              left: `${player.x}%`,
              top: `${player.y}%`,
              transform: "translate(-50%, -50%)",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: teamColor === "red" ? "#CC1A1A" : "#000000",
              border: selectedPlayer === player.id ? "3px solid #FFFF00" : "2px solid #FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "grab",
              userSelect: "none",
              transition: "all 200ms",
              boxShadow: selectedPlayer === player.id ? "0 0 20px rgba(255, 255, 0, 0.5)" : "none",
              zIndex: selectedPlayer === player.id ? 10 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translate(-50%, -50%)";
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#FFFFFF", lineHeight: "1" }}>
                {player.number}
              </div>
              <div style={{ fontSize: "10px", color: "#FFFFFF", fontWeight: "600" }}>
                {player.position}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Player Details */}
      {selectedPlayer && (
        <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", margin: "0 0 4px 0" }}>
                Jogador #{players.find(p => p.id === selectedPlayer)?.number}
              </h3>
              <p style={{ fontSize: "14px", color: "#999999", margin: 0 }}>
                Posição: {players.find(p => p.id === selectedPlayer)?.position}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "1px solid #333333",
                  borderRadius: "6px",
                  color: "#CCCCCC",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Copy style={{ width: "14px", height: "14px" }} />
                Duplicar
              </button>
              <button
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "1px solid #CC1A1A",
                  borderRadius: "6px",
                  color: "#CC1A1A",
                  fontSize: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Trash2 style={{ width: "14px", height: "14px" }} />
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div style={{ background: "#1A1A1A", border: "1px solid #333333", borderRadius: "12px", padding: "16px" }}>
        <p style={{ fontSize: "14px", color: "#CCCCCC", lineHeight: "1.6", margin: 0 }}>
          💡 <strong>Dica:</strong> Arraste os jogadores pelo campo para posicioná-los. Selecione uma formação para aplicar automaticamente. Salve suas estratégias para reutilizar em futuras partidas.
        </p>
      </div>
    </div>
  );
};

export default TacticalBoard;
