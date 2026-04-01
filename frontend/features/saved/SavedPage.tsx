import { useEffect, useState } from "react";

type Verse = {
  reference: string;
  text: string;
};

export default function SavedPage() {
  const [verses, setVerses] = useState<Verse[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("verses");
    if (data) setVerses(JSON.parse(data));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">💾 Saved Verses</h1>

      {verses.length === 0 && (
        <p className="text-gray-500">No saved verses yet.</p>
      )}

      {verses.map((v, i) => (
        <div key={i} className="bg-card p-4 rounded-xl">
          <h2 className="font-semibold">{v.reference}</h2>
          <p className="text-sm text-gray-300 mt-2">{v.text}</p>
        </div>
      ))}
    </div>
  );
}
