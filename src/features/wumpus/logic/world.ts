import seedrandom from "seedrandom";
import {
  MAX_WORLD_GENERATION_ATTEMPTS,
  PIT_COUNT,
  START,
  BOARD_SIZE,
} from "@/features/wumpus/constants";
import type { Position, World } from "@/features/wumpus/types";

export function keyAt(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

export function samePos(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

export function inBounds(pos: Position, size: number): boolean {
  return pos.x >= 0 && pos.y >= 0 && pos.x < size && pos.y < size;
}

export function neighbors(pos: Position, size: number): Position[] {
  const candidates: Position[] = [
    { x: pos.x + 1, y: pos.y },
    { x: pos.x - 1, y: pos.y },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x, y: pos.y - 1 },
  ];

  return candidates.filter((p) => inBounds(p, size));
}

function allCells(size: number): Position[] {
  const cells: Position[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      cells.push({ x, y });
    }
  }
  return cells;
}

export function getPerceptsForCell(
  pos: Position,
  size: number,
  pits: Set<string>,
  wumpus: Position,
): { breeze: boolean; stench: boolean } {
  const adjacent = neighbors(pos, size);
  return {
    breeze: adjacent.some((p) => pits.has(keyAt(p))),
    stench: adjacent.some((p) => samePos(p, wumpus)),
  };
}

function getReachableSafeCells(world: World, from: Position): Set<string> {
  const queue: Position[] = [{ ...from }];
  const seen = new Set<string>([keyAt(from)]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    for (const next of neighbors(current, world.size)) {
      const nextKey = keyAt(next);
      const blocked = world.pits.has(nextKey) || samePos(next, world.wumpus);
      if (blocked || seen.has(nextKey)) {
        continue;
      }
      seen.add(nextKey);
      queue.push(next);
    }
  }

  return seen;
}

function hasSafePath(world: World, from: Position, to: Position): boolean {
  return getReachableSafeCells(world, from).has(keyAt(to));
}

function combinationsOf<T>(items: T[], choose: number): T[][] {
  const out: T[][] = [];

  const backtrack = (start: number, path: T[]) => {
    if (path.length === choose) {
      out.push([...path]);
      return;
    }

    for (let i = start; i < items.length; i += 1) {
      path.push(items[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  };

  backtrack(0, []);
  return out;
}

function hasUniqueHazardInference(world: World, pitCount: number): boolean {
  const safeReachable = getReachableSafeCells(world, START);
  const cells = allCells(world.size);

  const observedSafe = cells.filter((cell) => safeReachable.has(keyAt(cell)));
  const observedSafeKeys = new Set(observedSafe.map((cell) => keyAt(cell)));

  const observedPercepts = new Map<string, string>();
  for (const cell of observedSafe) {
    const percept = getPerceptsForCell(cell, world.size, world.pits, world.wumpus);
    observedPercepts.set(keyAt(cell), `${percept.breeze ? 1 : 0}${percept.stench ? 1 : 0}`);
  }

  const unknownCells = cells.filter((cell) => !observedSafeKeys.has(keyAt(cell)));
  if (unknownCells.length !== pitCount + 1) {
    return false;
  }
  let validAssignments = 0;

  for (const wumpusCandidate of unknownCells) {
    const pitCandidates = unknownCells.filter((cell) => !samePos(cell, wumpusCandidate));
    const pitCombos = combinationsOf(pitCandidates, pitCount);

    for (const pitCombo of pitCombos) {
      const pits = new Set<string>(pitCombo.map((p) => keyAt(p)));
      let matches = true;

      for (const safeCell of observedSafe) {
        const actual = observedPercepts.get(keyAt(safeCell));
        const candidate = getPerceptsForCell(safeCell, world.size, pits, wumpusCandidate);
        const candidateSignature = `${candidate.breeze ? 1 : 0}${candidate.stench ? 1 : 0}`;
        if (actual !== candidateSignature) {
          matches = false;
          break;
        }
      }

      if (matches) {
        validAssignments += 1;
        if (validAssignments > 1) {
          return false;
        }
      }
    }
  }

  return validAssignments === 1;
}

function isValidWorld(world: World, pitCount: number): boolean {
  const startKey = keyAt(START);
  if (world.pits.has(startKey) || samePos(world.wumpus, START)) {
    return false;
  }

  const goldOnHazard = world.pits.has(keyAt(world.gold)) || samePos(world.gold, world.wumpus);
  if (goldOnHazard) {
    return false;
  }

  const startNeighbors = neighbors(START, world.size);
  const hasSafeNeighbor = startNeighbors.some((p) => {
    const k = keyAt(p);
    return !world.pits.has(k) && !samePos(p, world.wumpus);
  });
  if (!hasSafeNeighbor) {
    return false;
  }

  const safeCellCount = world.size * world.size - world.pits.size - 1;
  const reachableSafe = getReachableSafeCells(world, START);
  const allSafeConnected = reachableSafe.size === safeCellCount;
  if (!allSafeConnected) {
    return false;
  }

  const canCompleteObjective =
    hasSafePath(world, START, world.gold) && hasSafePath(world, world.gold, START);

  return canCompleteObjective && hasUniqueHazardInference(world, pitCount);
}

function randomInt(rng: seedrandom.PRNG, maxExclusive: number): number {
  return Math.floor(rng() * maxExclusive);
}

function createWorldAttempt(size: number, pitCount: number, rng: seedrandom.PRNG): World {
  const cells = allCells(size).filter((cell) => !samePos(cell, START));
  const pool = [...cells];

  const pick = (): Position => {
    const idx = randomInt(rng, pool.length);
    const [selected] = pool.splice(idx, 1);
    return selected;
  };

  const wumpus = pick();

  const pits = new Set<string>();
  for (let i = 0; i < pitCount && pool.length > 0; i += 1) {
    pits.add(keyAt(pick()));
  }

  const provisionalWorld: World = {
    size,
    pits,
    wumpus,
    gold: { ...START },
  };

  const reachableSafe = Array.from(getReachableSafeCells(provisionalWorld, START))
    .map((k) => {
      const [x, y] = k.split(",").map(Number);
      return { x, y };
    })
    .filter((cell) => !samePos(cell, START));

  const safeGoldPool = reachableSafe.filter(
    (cell) => !pits.has(keyAt(cell)) && !samePos(cell, wumpus),
  );

  if (safeGoldPool.length === 0) {
    return { ...provisionalWorld, gold: { ...START } };
  }

  let bestDistance = -1;
  const farCells: Position[] = [];
  for (const cell of safeGoldPool) {
    const distance = Math.abs(cell.x - START.x) + Math.abs(cell.y - START.y);
    if (distance > bestDistance) {
      bestDistance = distance;
      farCells.length = 0;
      farCells.push(cell);
    } else if (distance === bestDistance) {
      farCells.push(cell);
    }
  }

  const gold = farCells[randomInt(rng, farCells.length)];
  return { size, pits, wumpus, gold };
}

export function createWorld(
  size = BOARD_SIZE,
  pitCount = PIT_COUNT,
  seed = crypto.randomUUID(),
): World {
  const rng = seedrandom(seed);

  for (let attempt = 0; attempt < MAX_WORLD_GENERATION_ATTEMPTS; attempt += 1) {
    const candidate = createWorldAttempt(size, pitCount, rng);
    if (isValidWorld(candidate, pitCount)) {
      return candidate;
    }
  }

  for (let emergency = 0; emergency < 100_000; emergency += 1) {
    const candidate = createWorldAttempt(size, pitCount, rng);
    if (isValidWorld(candidate, pitCount)) {
      return candidate;
    }
  }

  // As a last resort, return a generated world that still respects configured size and pit count.
  return createWorldAttempt(size, pitCount, rng);
}
