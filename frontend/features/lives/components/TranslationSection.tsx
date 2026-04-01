import TranslationBox from "../components/TranslationBox";

interface TranslationSectionProps {
  sourceText: string;
  liveTranslation?: string | null;
}

export default function TranslationSection({
  sourceText,
  liveTranslation,
}: TranslationSectionProps) {
  return (
    <div className="space-y-4">
      {sourceText ? (
        <TranslationBox text={sourceText} />
      ) : (
        <div className="bg-card p-4 rounded-xl text-gray-500">
          Tap <span className="font-medium">Start Listening</span> to get live
          translations here.
        </div>
      )}

      {liveTranslation && (
        <div className="mt-2 text-sm text-gray-400">
          <strong>Live translation:</strong> {liveTranslation}
        </div>
      )}
    </div>
  );
}
