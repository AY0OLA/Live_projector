import { useEffect, useState } from "react";
import { db } from "../../src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import useAuth from "../auth/useAuth";

type Sermon = {
  userId: number;
  sessionId: string;
  transcript: string[];
  verse?: string;
  verseText?: string;
  translation?: string;
};

export default function AnalyticsPage() {
  const { user, loading } = useAuth();

  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "sermons"));
        const data: Sermon[] = snapshot.docs.map((doc) => doc.data() as Sermon);

       
        const userData = data.filter((d) => d.userId === user.id);

        setSermons(userData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Loading state
  if (loading || isLoading) {
    return <p className="text-gray-400">Loading analytics...</p>;
  }

  // Empty state
  if (sermons.length === 0) {
    return (
      <p className="text-gray-500">
        No sermons yet. Start a live session to see analytics.
      </p>
    );
  }

  // Stats
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
        <div className="bg-[#1A1A1A] p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Total Sermons</p>
          <h2 className="text-2xl font-bold">{totalSermons}</h2>
        </div>

        <div className="bg-[#1A1A1A] p-4 rounded-xl">
          <p className="text-gray-400 text-sm">Total Words</p>
          <h2 className="text-2xl font-bold">{totalWords}</h2>
        </div>
      </div>

      {/* Top Verses */}
      <div className="bg-[#1A1A1A] p-4 rounded-xl">
        <h2 className="font-semibold mb-2">🔥 Top Verses</h2>

        {topVerses.length === 0 ? (
          <p className="text-gray-500 text-sm">No verses yet</p>
        ) : (
          topVerses.map(([verse, count], i) => (
            <p key={i} className="text-sm text-gray-300">
              {verse} ({count} times)
            </p>
          ))
        )}
      </div>

      {/* Recent Sermons */}
      <div className="bg-[#1A1A1A] p-4 rounded-xl">
        <h2 className="font-semibold mb-2">🕒 Recent Sermons</h2>

        {sermons.slice(0, 5).map((s, i) => (
          <div key={i} className="text-sm text-gray-400 mb-2">
            <p className="text-purple-400">{s.verse || "No verse detected"}</p>
            <p>{s.transcript?.slice(0, 5).join(" ")}...</p>
          </div>
        ))}
      </div>
    </div>
  );
}
