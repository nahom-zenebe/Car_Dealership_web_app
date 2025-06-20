// App.tsx or main route file
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingLayout from "./Landingpage/layout";
import LandingPage from "./Landingpage/page";
import SettingsPage from "@/app/dashboard/settingpage/page"; 
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <Toaster /> {/* Toast notifications visible everywhere */}

        <Routes>
          {/* Landing Page with Layout */}
          <Route
            path="/"
            element={
              <LandingLayout>
                <LandingPage />
              </LandingLayout>
            }
          />


          <Route path="/settingpage" element={<SettingsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
