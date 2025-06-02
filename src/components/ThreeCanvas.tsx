import React, { useEffect, useRef } from "react";
import { GameScene } from "../scenes/GameScene";
import { useGame } from "../context/GameContext";

export const ThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameSceneRef = useRef<GameScene | null>(null);

  const { diceValue, diceRollId , addLog, setCanRoll } = useGame();

  useEffect(() => {
    if (containerRef.current) {
      gameSceneRef.current = new GameScene(containerRef.current, {
        getDiceValue: () => diceValue ?? 0,
        addLog,
        setCanRoll,
      });
    }

    return () => {
      gameSceneRef.current?.dispose();
    };
  }, []);


  useEffect(() => {
    if (diceValue !== null && gameSceneRef.current) {
      gameSceneRef.current.startTurnWithDiceValue(diceValue);
      console.log("куб брошен на", diceValue);
    }
  }, [diceValue,diceRollId]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    />
  );
};
