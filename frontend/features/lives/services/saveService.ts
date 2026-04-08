import { db } from "../../../src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function saveSermon(data: {
  userId: number;
  sessionId: string;
  transcript: string[];
  verse?: string;
  verseText?: string;
  translation?: string;
}) {
  try {
    await addDoc(collection(db, "sermons"), {
      ...data,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Save error:", err);
  }
}
