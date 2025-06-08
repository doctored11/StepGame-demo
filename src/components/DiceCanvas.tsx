import React, { useEffect, useRef } from "react";
import { RollScene } from "../scenes/RollScene";
import { useGame } from "../context/GameContext";

type DiceCanvasProps = {
  onRollComplete?: (value: number) => void;
};

export const DiceCanvas: React.FC<DiceCanvasProps> = ({ onRollComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<RollScene | null>(null);

  const { diceValue, diceRollId, setCanRoll} = useGame();

  useEffect(() => {
    if (!canvasRef.current) return;
    const rollScene = new RollScene(canvasRef.current);
    sceneRef.current = rollScene;

    rollScene.loadDiceModel("/assets/models/dice.glb");

    return () => {
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current && diceRollId > 0) {
    setCanRoll(false)
      const value = Math.floor(Math.random() * 6) + 1;
      setTimeout(() => {
        sceneRef.current?.rollTo(value, () => {
          console.log([diceRollId, diceValue]);
          onRollComplete?.(value);
          
        });
      }, 100);
    }
  }, [diceRollId]);

  return (
    <canvas
      ref={canvasRef}
      width={160}
      height={160}
      style={{
        background: "#333",
        borderRadius: "0.5rem",
      }}
    />
  );
};
