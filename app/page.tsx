// App.tsx or main route file

'use client';
import { Toaster } from 'react-hot-toast';

import LandingLayout from "./Landingpage/layout";
import LandingPage from "./Landingpage/page";

export default function App() {
  return (

      <div    style={{ background: "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)" }}>
        <Toaster /> 
  
         
              <LandingLayout>
                <LandingPage />
              </LandingLayout>

    
   
      </div>

  );
}
