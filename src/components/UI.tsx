import React from "react";
import { useGame } from "../context/GameContext";
import { DiceCanvas } from "./DiceCanvas";
import { useGameSceneRef } from "../context/GameSceneContext";
import { GameOver } from "./GameOver";
import "./UI.css";

export function UI() {
  const { diceValue, setDiceValue, canRoll, rollDice, log, score, addLog } =
    useGame();
  const gameSceneRef = useGameSceneRef();

  const handleRoll = () => {
    const value = rollDice();
  };

  const handleAnimationComplete = (value: number) => {
    setDiceValue(value);
    addLog(`Выпало: ` + value);

    gameSceneRef.current?.startTurnWithDiceValue(value);
  };

  return (
    <>
      <GameOver />

      <div className="ui-panel">
        <DiceCanvas onRollComplete={handleAnimationComplete} />

        <button className="ui-button" onClick={handleRoll} disabled={!canRoll}>
          Бросить кубик
        </button>

        <p className="ui-stats">Выпало: {diceValue ?? "??"}</p>
        <p className="ui-stats">HP: 1</p>
        <p className="ui-stats">🍒 Очки: {score} / 9</p>

        <div className="ui-log">
          {[...log].reverse().map((entry, idx) => (
            <p key={idx} className="ui-log-entry">
              {entry}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
