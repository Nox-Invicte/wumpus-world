import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import type { LeaderboardEntry, SubmitRunPayload } from "./types";

function formatElapsedTime(ms: number): string {
  const clampedMs = Math.max(0, ms);
  const totalSeconds = Math.floor(clampedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((clampedMs % 1000) / 10);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export async function submitRun(payload: SubmitRunPayload): Promise<string> {
  try {
    console.log("Submitting run to Firestore:", payload);
    console.log("db object:", db);
    console.log("db is defined:", !!db);
    
    if (!db) {
      throw new Error("Firebase db not initialized - environment variables may be missing");
    }

    const collRef = collection(db, "leaderboard");
    console.log("Collection reference created:", collRef);

    const docData = {
      playerName: payload.playerName,
      elapsedMs: payload.elapsedMs,
      wumpusKilled: payload.wumpusKilled,
      treasureCollected: payload.treasureCollected,
      timestamp: Date.now(),
    };
    console.log("About to call addDoc with data:", docData);

    // Wrap in timeout to detect hanging promises
    const addDocPromise = addDoc(collRef, docData);
    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("addDoc() timed out after 10 seconds - likely a network/firewall issue")), 10000)
    );

    const docRef = await Promise.race([addDocPromise, timeoutPromise]);
    console.log("Run submitted successfully with ID:", docRef.id || docRef);
    return docRef.id || docRef;
  } catch (error) {
    console.error("Error submitting run:", error);
    throw error;
  }
}

export async function fetchLeaderboard(topCount: number = 10): Promise<LeaderboardEntry[]> {
  try {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("elapsedMs", "asc"),
      limit(topCount)
    );

    const snapshot = await getDocs(q);
    const entries: LeaderboardEntry[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        playerName: data.playerName || "Anonymous",
        elapsedMs: data.elapsedMs || 0,
        wumpusKilled: data.wumpusKilled || false,
        treasureCollected: data.treasureCollected || false,
        timestamp: data.timestamp || Date.now(),
        formattedTime: formatElapsedTime(data.elapsedMs || 0),
      });
    });

    return entries;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
}
