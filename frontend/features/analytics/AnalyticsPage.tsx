import { useEffect, useState } from "react";
import { db } from "../../src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import useAuth from "../auth/useAuth";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [sermons, setSermons] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "sermons"));
      const data = snapshot.docs.map((doc) => doc.data());

      const userData = data.filter((d) => d.userId === user?.uid);
      setSermons(userData);
    };

    fetchData();
  }, [user]);

  // 📊 Calculations
  const totalSermons = sermons.length;

  const totalWords = sermons.reduce((acc, s) => {
    return acc + (s.transcript?.join(" ").split(" ").length || 0);
  }, 0);

  const verseCount: Record<string, number> = {};

  sermons.forEach((s) => {
    if (s.verse) {
      verseCount[s.verse] = (verseCount[s.verse] || 0) + 1;
    }
  });

  const topVerses = Object.entries(verseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">📊 Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-xl">
          <p>Total Sermons</p>
          <h2 className="text-2xl font-bold">{totalSermons}</h2>
        </div>

        <div className="bg-card p-4 rounded-xl">
          <p>Total Words</p>
          <h2 className="text-2xl font-bold">{totalWords}</h2>
        </div>
      </div>

      {/* Top Verses */}
      <div className="bg-card p-4 rounded-xl">
        <h2 className="font-semibold mb-2">🔥 Top Verses</h2>

        {topVerses.map(([verse, count], i) => (
          <p key={i} className="text-sm text-gray-300">
            {verse} ({count} times)
          </p>
        ))}
      </div>

      {/* Recent */}
      <div className="bg-card p-4 rounded-xl">
        <h2 className="font-semibold mb-2">🕒 Recent Sermons</h2>

        {sermons.slice(0, 5).map((s, i) => (
          <p key={i} className="text-sm text-gray-400">
            {s.verse || "No verse"} — {s.transcript?.slice(0, 5).join(" ")}...
          </p>
        ))}
      </div>
    </div>
  );
}
