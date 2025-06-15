import * as THREE from "three";
import { Enemy } from "./Enemy";
import { Tile } from "./Tile";
import { findPath, findReachableTiles } from "./Pathfinder";

export class BlueEnemy extends Enemy {
  private async moveRandomly(gm: any, playerTile: Tile) {
    const blockedTiles = new Set<Tile>([playerTile]);

    const reachableTiles: Tile[] = findReachableTiles(this.currentTile, 2, gm, {
      blockedTiles,
    });

    const options = reachableTiles.filter((t) => t !== this.currentTile);

    if (options.length === 0) {
      console.log("❌ Нет доступных тайлов для _случайного движения.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * options.length);
    const targetTile = options[randomIndex];

    const pathToTarget = findPath(this.currentTile, targetTile, gm);

    const steps = pathToTarget.slice(0, 2);

    if (steps.length > 0) {
      console.log(
        `🎰 синий идёт рандомно по : ${steps.map((t) => t.id).join(" → ")}`
      );
      await this.moveAlongTiles(steps);
      this.currentTile = steps[steps.length - 1];
      console.log(`✅ синий теперь на тайле: ${this.currentTile.id}`);
    }
  }

  public async takeTurn(): Promise<void> {
    const gm = this.master.getGameMap();
    const current = this.currentTile;
    const playerTile = this.master.getPlayer().currentTile;

    const berryTile = gm.getAllTiles().find((t) => t.berry != null);
    if (!berryTile) {
      console.log(" ❌ [BlueEnemy] ❌ Нет ягод на карте.");
      return;
    }

    console.log("\n [ХОД синего]");

    const pathToPlayer = findPath(current, playerTile, gm, {
      allowEndOnBlocked: true,
    });

    const pathToPlayerIds = pathToPlayer.map((t) => t.id);

    if (pathToPlayer.length === 0) {
      console.log(`⚔️ синий уже на тайле игрока`);
      return;
    }

    if (pathToPlayer.length === 2) {
      const steps = pathToPlayer.slice(0, 2);
      console.log(
        `⚔️ синий двигается и Атакует игрока через тайлы: ${steps
          .map((t) => t.id)
          .join(" → ")}`
      );
      await this.moveAlongTiles(steps);
      this.currentTile = steps[steps.length - 1];
      console.log(`✅ синий теперь на тайле: ${this.currentTile.id}`);
      return;
    }

    const playerToBerry = findPath(playerTile, berryTile, gm);
    const playerPathIds = playerToBerry.map((t) => t.id);

    if (playerToBerry.length === 0) {
      console.log("❌ Игрок не может добраться до ягоды.");
      return;
    }

    const midIndex = Math.floor(playerToBerry.length / 2);
    const midTile = playerToBerry[midIndex];
    console.log(`🎯 Целевой тайл  : ${midTile.id}`);

    if (midTile === current) {
      await this.moveRandomly(gm, playerTile);
      return;
    }

    const pathToMid = findPath(current, midTile, gm, {
      exactSteps: 2,
      blockedTiles: new Set([playerTile]),
      allowEndOnBlocked: false,
    });

    const pathToMidIds = pathToMid.map((t) => t.id);

    if (pathToMid.length === 0) {
      console.log("❌синий не может добраться до цели.");
      await this.moveRandomly(gm, playerTile);
      return;
    }

    let steps: Tile[] = [];

    if (pathToMid.length >= 2) {
      steps = pathToMid.slice(0, 2);
    } else if (pathToMid.length === 1) {
      const firstStep = pathToMid[0];

      const neighbors = findReachableTiles(firstStep, 1, gm, {
        blockedTiles: new Set([playerTile, current]),
      });

      if (neighbors.length > 0) {
        steps = [firstStep, neighbors[0]];
      } else {
        steps = [firstStep];
      }
    }

    if (steps.length > 0) {
      await this.moveAlongTiles(steps);
      this.currentTile = steps[steps.length - 1];
      console.log(`✅ синий теперь на тайле: ${this.currentTile.id}`);
    } else {
      await this.moveRandomly(gm, playerTile);
    }
  }
}
