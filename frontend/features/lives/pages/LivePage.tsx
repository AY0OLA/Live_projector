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
  const [copied, setCopied] = useState(false);

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

  const normalizedVerse = verse ?? null;
  const normalizedVerseText = verseText ?? "";
  const normalizedTranslation = translation ?? "";
  const translationSource = normalizedVerseText || transcript.join(" ");

  const copyLink = async () => {
    if (!joinLink) return;

    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
      setCopied(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await saveSermon({
        userId: user.id,
        sessionId,
        transcript,
        verse: normalizedVerse ?? "",
        verseText: normalizedVerseText,
        translation: normalizedTranslation,
      });
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🔴 Live Sermon</h1>
        <span className="text-sm text-gray-400">
          {error ? "Mic Error" : isRecording ? "Listening..." : "Idle"}
        </span>
      </div>

      <Waveform active={isRecording} />

      <div className="grid md:grid-cols-2 gap-6">
        <TranscriptBox transcript={transcript} />

        <div className="space-y-4">
          <VerseSection
            verse={normalizedVerse}
            verseText={normalizedVerseText}
            onSave={() =>
              saveVerse({
                reference: normalizedVerse ?? "",
                text: normalizedVerseText,
              })
            }
          />

          <TranslationSection
            sourceText={translationSource}
            liveTranslation={normalizedTranslation}
          />
        </div>

        <div className="bg-[#1A1A1A] p-4 rounded-xl text-sm space-y-2">
          <p className="text-gray-400">Share this link</p>

          <a
            href={joinLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 break-words"
          >
            {joinLink || "Generating link..."}
          </a>

          <button onClick={copyLink} className="text-xs text-green-400">
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          disabled={!!error}
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-3 rounded-full transition ${
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

        <button
          onClick={handleSave}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        >
          💾 Save Sermon
        </button>
      </div>

      <div className="bg-[#1A1A1A] p-5 rounded-xl text-center space-y-3">
        <p className="text-sm text-gray-400">Scan to join live</p>

        {joinLink ? <QRCodeDisplay url={joinLink} /> : <p>Generating QR...</p>}

        <p className="text-xs text-gray-500 break-all">{joinLink}</p>
      </div>
    </div>
  );
}
