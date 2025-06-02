
import React, { useEffect, useRef } from "react";
import { GameScene } from "../scenes/GameScene";

export const ThreeCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameSceneRef = useRef<GameScene | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      gameSceneRef.current = new GameScene(containerRef.current);
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
