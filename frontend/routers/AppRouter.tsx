import { BrowserRouter, Routes, Route } from "react-router-dom";
import LivePage from "../features/lives/pages/LivePage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LivePage />} />
      </Routes>
    </BrowserRouter>
  );
}
