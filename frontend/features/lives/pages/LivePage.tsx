import { useEffect, useState } from "react";
import useMicStream from "../hooks/useMicStream";
import useSavedVerses from "../hooks/useSavedVerses";
import Waveform from "../components/Waveform";
import QRCodeDisplay from "../../../shared/components/QRCodeDisplay";
import { saveSermon } from "../services/saveService";
import useAuth from "../../auth/useAuth";

import TranscriptBox from "../components/TranscriptBox";
import VerseSection from "../components/VerseSection";
import TranslationSection from "../components/TranslationSection";

export default function LivePage() {
  const { user } = useAuth();
  const [sessionId] = useState(() =>
    Math.random().toString(36).substring(2, 8),
  );
  const [joinLink, setJoinLink] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinLink(`${window.location.origin}/audience/${sessionId}`);
    }
  }, [sessionId]);

  const {
    startRecording,
    stopRecording,
    isRecording,
    transcript,
    verse,
    verseText,
    translation,
    error,
  } = useMicStream(sessionId);

  const { saveVerse } = useSavedVerses();
  const translationSource = verseText || transcript.join(" ");

  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    if (!joinLink) return;
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="p-6 items-center max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🔴 Live Sermon</h1>
        <span
          className="text-sm text-gray-400"
          role="status"
          aria-live="polite"
        >
          {isRecording ? "Listening..." : "Idle"}
        </span>
      </div>

      <Waveform active={isRecording} />

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-6">
        <TranscriptBox transcript={transcript} />

        <div className="space-y-4">
          <VerseSection
            verse={verse}
            verseText={verseText}
            onSave={() => saveVerse({ reference: verse!, text: verseText! })}
          />
          <TranslationSection
            sourceText={translationSource}
            liveTranslation={translation}
          />
        </div>

        {/* Share link card */}
        <div className="bg-card p-3 rounded text-sm break-words">
          <div className="mb-2">Share this link with your audience</div>
          <a
            href={joinLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 break-words"
            aria-disabled={!joinLink}
          >
            {joinLink || "Generating link..."}
          </a>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          disabled={!!error}
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-3 rounded-full ${
            error
              ? "bg-gray-600 cursor-not-allowed"
              : isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {error
            ? "Microphone Error"
            : isRecording
              ? "Stop Listening"
              : "Start Listening"}
        </button>

        <button onClick={copyLink} className="text-xs text-green-400">
          {copied ? "Copied" : "Copy Link"}
        </button>

        <button
          onClick={() =>
            saveSermon({
              userId: user?.uid || "",
              sessionId,
              transcript,
              verse,
              verseText,
              translation,
            })
          }
          className="bg-green-600 px-4 py-2 rounded"
        >
          💾 Save Sermon
        </button>
      </div>

      {/* QR + link card */}
      <div className="bg-card p-4 rounded-xl text-center space-y-3">
        <p className="text-sm text-gray-400">Scan to join live</p>
        {joinLink ? (
          <QRCodeDisplay url={joinLink} />
        ) : (
          <div>Generating QR…</div>
        )}
        <p className="text-xs text-gray-500 break-all">{joinLink}</p>
      </div>
    </div>
  );
}
