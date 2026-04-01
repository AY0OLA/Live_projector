import VerseCard from "../components/VerseCard";

interface VerseSectionProps {
  verse: string | null;
  verseText: string | null;
  onSave: () => void;
}

export default function VerseSection({
  verse,
  verseText,
  onSave,
}: VerseSectionProps) {
  if (!verse || !verseText) return null;

  return <VerseCard reference={verse} text={verseText} onSave={onSave} />;
}
