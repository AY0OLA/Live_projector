import { useState } from "react";

export default function SettingsPage() {
  const [language, setLanguage] = useState("english");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">⚙️ Settings</h1>

      <div>
        <label className="block mb-2 ">Translation Language</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-teal-200 p-2 rounded text-center"
        >
          <option value="english" className="front-semibold ">
            English
          </option>
          <option value="yoruba" className="front-semibold ">
            Yoruba
          </option>
          <option value="french" className="front-semibold ">
            French
          </option>
          <option value="hausa" className="front-semibold ">
            Hausa
          </option>
          <option value="igbo" className="front-semibold ">
            Igbo
          </option>
        </select>
      </div>
    </div>
  );
}
