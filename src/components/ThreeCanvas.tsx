import React, { useEffect, useRef } from "react";
import { GameScene } from "../scenes/GameScene";
import { useGame } from "../context/GameContext";
import { GameSceneContext } from "../context/GameSceneContext";
interface Props {
  gameSceneRef: React.RefObject<GameScene | null>;
}
export const ThreeCanvas: React.FC<Props> = ({ gameSceneRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { diceValue, diceRollId, addLog, setCanRoll, addScore, setGameOver } =
    useGame();

  useEffect(() => {
    if (containerRef.current) {
      gameSceneRef.current = new GameScene(containerRef.current, {
        getDiceValue: () => diceValue ?? 0,
        addLog,
        setCanRoll,
        addScore,
        onGameOver: (result, turns) => {
          setGameOver(result, turns);
        },
      });
    }

    return () => {
      gameSceneRef.current?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    />
  );
};
