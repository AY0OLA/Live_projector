import { useEffect, useState } from "react";

type Verse = {
  reference: string;
  text: string;
};

export default function useSavedVerses() {
  const [saved, setSaved] = useState<Verse[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("verses");
    if (data) setSaved(JSON.parse(data));
  }, []);

  const saveVerse = (verse: Verse) => {
    const updated = [verse, ...saved];
    setSaved(updated);
    localStorage.setItem("verses", JSON.stringify(updated));
  };

  return { saved, saveVerse };
}
