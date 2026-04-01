import { useEffect, useState } from "react";

type Data = {
  verse?: string;
  verse_text?: string;
};

export default function PresentationPage() {
  const [verse, setVerse] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/audio");

    socket.onmessage = (event) => {
      const data: Data = JSON.parse(event.data);

      if (data.verse) setVerse(data.verse);
      if (data.verse_text) setText(data.verse_text);
    };

    return () => socket.close();
  }, []);

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center p-10">
      <div className="max-w-5xl text-center space-y-6">
        <h1 className="text-3xl text-purple-400 font-bold">{verse}</h1>

        <p className="text-4xl leading-relaxed text-white">
          {text || "Waiting for verse..."}
        </p>
      </div>
    </div>
  );
}
