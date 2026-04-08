import { useEffect, useState } from "react";
import { db } from "../../src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import useAuth from "../auth/useAuth";

type Sermon = {
  sessionId: string;
  transcript?: string[];
  verse?: string;
  userId: number | string;
};

export default function HistoryPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "sermons"));

        const data: Sermon[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Sermon),
        }));

        const filtered = data.filter((s) => s.userId === user.id);

        setSermons(filtered);
      } catch (err) {
        console.error("Error fetching sermons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return <p className="text-gray-400">Loading sermons...</p>;
  }

  return (
    <div className="space-y-4 max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold">📊 Sermon History</h1>

      {sermons.length === 0 && (
        <p className="text-gray-500 text-sm">No sermons found.</p>
      )}

      {sermons.map((s, i) => (
        <div
          key={i}
          className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5"
        >
          <p className="text-xs text-gray-500">Session: {s.sessionId}</p>

          <p className="mt-2 text-sm text-gray-300">
            {s.transcript?.slice(0, 3).join(" ") || "No transcript"}...
          </p>

          {s.verse && (
            <p className="text-purple-400 mt-2 font-medium">{s.verse}</p>
          )}
        </div>
      ))}
    </div>
  );
}
