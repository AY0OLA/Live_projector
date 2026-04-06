import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type Data = {
  transcript?: string;
  translation?: string;
  verse?: string;
  verse_text?: string;
};

export default function AudiencePage() {
  const { sessionId } = useParams();
  const [transcript, setTranscript] = useState<string[]>([]);
  const [translation, setTranslation] = useState("");
  const [verse, setVerse] = useState("");
  const [verseText, setVerseText] = useState("");

  useEffect(() => {
    const socket = new WebSocket(
      `${import.meta.env.VITE_WS_URL}?session=${sessionId}`,
    );

    socket.onmessage = (event) => {
      const data: Data = JSON.parse(event.data);

      if (data.transcript) {
        const t = data.transcript; 
        setTranscript((prev) => [...prev, t]);
      }

      if (data.translation) {
        setTranslation(data.translation);
      }

      if (data.verse) setVerse(data.verse);
      if (data.verse_text) setVerseText(data.verse_text);
    };

    return () => socket.close();
  }, [sessionId]);

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-lg font-bold text-center">📡 Live Service</h1>

      {/* Verse */}
      {verse && (
        <div className="bg-card p-4 rounded-xl">
          <h2 className="font-semibold">{verse}</h2>
          <p className="text-sm text-gray-300 mt-2">{verseText}</p>
        </div>
      )}

      {/* Translation */}
      <div className="bg-card p-4 rounded-xl">
        <p className="text-blue-300 text-sm">
          {translation || "Waiting for translation..."}
        </p>
      </div>

      {/* Transcript */}
      <div className="bg-card p-4 rounded-xl max-h-64 overflow-y-auto space-y-1">
        {transcript.map((line, i) => (
          <p key={i} className="text-xs text-gray-400">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
