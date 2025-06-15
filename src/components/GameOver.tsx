import React, { useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";
import { EndScene } from "../scenes/EndScene";
import "./GameOver.css";

export const GameOver: React.FC = () => {
  const { gameOver, score, turns } = useGame();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<EndScene | null>(null);

  useEffect(() => {
    if (!gameOver || !mountRef.current) return;

    const endScene = new EndScene(mountRef.current);
    sceneRef.current = endScene;

    const url =
      gameOver === "win"
        ? "/assets/models/player_1.glb"
        : gameOver === "lose"
        ? "/assets/models/red_1.glb"
        : "/assets/models/dice.glb";

    endScene.loadAndPlay(url);

    return () => {
      sceneRef.current?.dispose();
    };
  }, [gameOver]);

  if (!gameOver) return null;

  const title = {
    win: "Победа!",
    lose: "Ты проиграл!",
    stalemate: "Пат! тоже поражение, но поменьше",
  }[gameOver];

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <div className="game-over-canvas" ref={mountRef} />
        <div className="game-over-content">
          <h1 className="game-over-title">{title}</h1>
          <p className="game-over-stats">Счёт: {score}</p>
          <p className="game-over-stats">Ходов: {turns}</p>
        </div>
      </div>
    </div>
  );
};
