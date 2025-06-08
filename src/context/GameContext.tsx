import React, { createContext, useContext, useState, ReactNode } from "react";

interface GameContextProps {
  diceValue: number | null;
  diceRollId: number;
  setDiceValue: (value: number) => void;

  canRoll: boolean;
  setCanRoll: (canRoll: boolean) => void;

  rollDice: () => void;
  log: string[];
  addLog: (message: string) => void;

  score: number;
  addScore: (amount: number) => void;
  resetScore: () => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [diceRollId, setDiceRollId] = useState<number>(0);
  const [canRoll, setCanRoll] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const addScore = (amount: number) => setScore((prev) => prev + amount);
  const resetScore = () => setScore(0);

  const rollDice = () => {
    if (!canRoll) return;
    const value = Math.floor(Math.random() * 6) + 1;
    setDiceValue(value);
    setCanRoll(false);
    setDiceRollId((prev) => prev + 1);
    addLog(`Бросок кубика: ${value}`);
  };

  const addLog = (message: string) => {
    setLog((prev) => [...prev, message]);
  };

  return (
    <GameContext.Provider
      value={{
        diceValue,
        diceRollId,
        setDiceValue,
        canRoll,
        setCanRoll,
        rollDice,
        log,
        addLog,
        score,
        addScore,
        resetScore,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};
