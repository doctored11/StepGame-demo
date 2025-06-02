import React from "react";
import { useGame } from "../context/GameContext";
//todo - разделить+причесать
export function UI() {
  const { diceValue, canRoll, rollDice, log } = useGame();

  return (
    <div
      style={{
        position:"fixed",
        zIndex:5,
        right:0,
        top:0,
        display: "flex",
        flexDirection: "column",
        width: "200px",
        padding: "1rem",
        background: "#1e1e1e",
        color: "white",
        fontFamily: "sans-serif",
        gap: "1rem",
        borderLeft: "2px solid #444",
        height: "100vh",
      }}
    >
      <canvas
        width={160}
        height={160}
        style={{ background: "#333", borderRadius: "0.5rem" }}
      />
      <button
        onClick={rollDice}
        disabled={!canRoll}
        style={{
          padding: "0.5rem",
          background: canRoll ? "#3b82f6" : "#555",
          color: "white",
          border: "none",
          borderRadius: "0.25rem",
          cursor: canRoll ? "pointer" : "not-allowed",
        }}
      >
        Бросить кубик
      </button>
      <div>Выпало: {diceValue ?? "-"}</div>
      <div>HP: 3</div>
      <div
        style={{
          background: "#222",
          padding: "0.5rem",
          borderRadius: "0.25rem",
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        {log.map((entry, idx) => (
          <p key={idx} style={{ margin: 0 }}>
            {entry}
          </p>
        ))}
      </div>
    </div>
  );
}
