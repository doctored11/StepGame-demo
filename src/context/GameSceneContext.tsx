import { createContext, useContext, RefObject } from "react";
import { GameScene } from "../scenes/GameScene";
export const GameSceneContext =
  createContext<RefObject<GameScene | null> | null>(null);

export const useGameSceneRef = () => {
  const context = useContext(GameSceneContext);
  if (!context) throw new Error("Провайдер забыли!");
  return context;
};
