// App.tsx or main route file

import LandingLayout from "./Landingpage/layout";
import LandingPage from "./Landingpage/page";
import React, { createContext } from 'react';

import toast, { Toaster } from "react-hot-toast";

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
