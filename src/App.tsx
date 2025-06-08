import React, { useRef } from "react";
import { ThreeCanvas } from "./components/ThreeCanvas";
import { GameProvider } from "./context/GameContext";
import { UI } from "./components/UI";
import { GameSceneContext } from "./context/GameSceneContext";
import { GameScene } from "./scenes/GameScene";

export default function App() {
  const gameSceneRef = useRef<GameScene | null>(null);

  return (
    <GameSceneContext.Provider value={gameSceneRef}>
      <GameProvider>
        <ThreeCanvas gameSceneRef={gameSceneRef} />
        <UI />
      </GameProvider>
    </GameSceneContext.Provider>
  );
}
