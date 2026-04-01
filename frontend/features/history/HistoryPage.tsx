import { useEffect, useState } from "react";
import { db } from "../../src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import useAuth from "../auth/useAuth";

export default function HistoryPage() {
  const [sermons, setSermons] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "sermons"));
      const data = snapshot.docs.map((doc) => doc.data());

      setSermons(data.filter((s) => s.userId === user?.uid));
    };

    fetchData();
  }, [user]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">📊 Sermon History</h1>

      {sermons.map((s, i) => (
        <div key={i} className="bg-card p-4 rounded-xl">
          <p className="text-sm text-gray-400">Session: {s.sessionId}</p>

          <p className="mt-2 text-sm">
            {s.transcript?.slice(0, 3).join(" ")}...
          </p>

          <p className="text-purple-400 mt-2">{s.verse}</p>
        </div>
      ))}
    </div>
  );
}
