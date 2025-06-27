// App.tsx or main route file

import LandingLayout from "./Landingpage/layout";
import LandingPage from "./Landingpage/page";
import React, { createContext } from 'react';

import toast, { Toaster } from "react-hot-toast";

export default function App() {
  return (

      <div>
        <Toaster /> 
   
  
         
              <LandingLayout>
                <LandingPage />
              </LandingLayout>
          
      


    
   
      </div>

  );
}
