import { useState } from "react";

export default function SettingsPage() {
  const [language, setLanguage] = useState("english");
  const upgrade = async () => {
    const res = await fetch("http://localhost:8000/create-checkout-session", {
      method: "POST",
    });

    const data = await res.json();

    window.location.href = data.url;
  };

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
      <button onClick={upgrade} className="bg-purple-600 px-4 py-2 rounded">
        🚀 Upgrade to Pro
      </button>
    </div>
  );
}
