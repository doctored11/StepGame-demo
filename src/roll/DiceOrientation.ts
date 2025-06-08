import { Euler } from "three";

export const DiceOrientations: Record<number, Euler> = {
  1: new Euler(0, 0, Math.PI / 2),
  2: new Euler(Math.PI, 0, 0),
  3: new Euler(-Math.PI / 2, 0, 0),
  4: new Euler(Math.PI / 2, 0, 0),
  5: new Euler(0, 0, 0),
  6: new Euler(0, -Math.PI / 2, -Math.PI / 2),
};
