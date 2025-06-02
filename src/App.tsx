import React from "react";
import { ThreeCanvas } from "./components/ThreeCanvas";
import { GameProvider } from "./context/GameContext";
import { UI } from "./components/UI";

export default function App() {
  return (
    <GameProvider>
      <ThreeCanvas />;
      <UI />
    </GameProvider>
  );
}
