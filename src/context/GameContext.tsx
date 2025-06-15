import React, { createContext, useContext, useState, ReactNode } from "react";

type GameResult = "win" | "lose" | "stalemate" | null;

interface GameContextProps {
  diceValue: number | null;
  diceRollId: number;
  setDiceValue: (value: number) => void;

  canRoll: boolean;
  setCanRoll: (canRoll: boolean) => void;

  rollDice: () => number;
  log: string[];
  addLog: (message: string) => void;

  score: number;
  addScore: (amount: number) => void;
  resetScore: () => void;

  gameOver: GameResult;
  turns: number;
  setGameOver: (result: GameResult, turns: number) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [diceRollId, setDiceRollId] = useState<number>(0);
  const [canRoll, setCanRoll] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOverState] = useState<GameResult>(null);
  const [turns, setTurns] = useState(0);

  const addScore = (amount: number) => setScore((prev) => prev + amount);
  const resetScore = () => setScore(0);

  const setGameOver = (result: GameResult, finalTurns: number) => {
    setGameOverState(result);
    setTurns(finalTurns);
  };

  const rollDice = () => {
    if (!canRoll) return 0;
    const value = Math.floor(Math.random() * 6) + 1;
    // setDiceValue(value);
    setCanRoll(false);
    setDiceRollId((prev) => prev + 1);
    addLog(`Кубик брошен...`);
    
    return value;
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
        gameOver,
        turns,
        setGameOver,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("Нужен провайдер");
  return context;
};
