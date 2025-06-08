import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { DiceCanvas } from "./DiceCanvas";
import { useGameSceneRef } from "../context/GameSceneContext";

//todo - разделить+причесать
export function UI() {
  const { diceValue, setDiceValue, canRoll, rollDice, log, addLog, score } =
    useGame();

  const gameSceneRef = useGameSceneRef();
  const handleRoll = () => {
    rollDice();
  };

  const handleAnimationComplete = (value: number) => {
    addLog(`Выпало: ${value}`);

    setDiceValue(value);
    gameSceneRef.current?.startTurnWithDiceValue(value); // ну тут будет пока что todo -перенести
  };

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 5,
        right: 0,
        top: 0,
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
      <DiceCanvas onRollComplete={handleAnimationComplete} />

      <button
        onClick={handleRoll}
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
      <div>Выпало: {diceValue ?? diceValue ?? "??"}</div>
      <div>HP: 3</div>
      <div>🍒 Очки: {score}</div>

      <div
        style={{
          background: "#222",
          padding: "0.5rem",
          borderRadius: "0.25rem",
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            background: "#222",
            padding: "0.5rem",
            borderRadius: "0.25rem",
            flexGrow: 1,
            overflowY: "auto",
          }}
        >
          {[...log].reverse().map((entry, idx) => (
            <p
              key={idx}
              style={{
                margin: 0,
                padding: "0.25rem 0.5rem",
                backgroundColor: idx % 2 === 0 ? "#2a2a2a" : "#1c1c1c",
              }}
            >
              {entry}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
