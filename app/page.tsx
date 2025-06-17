import LandingLayout from "./Landingpage/layout";
import LandingPage from "./Landingpage/page";
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <div >
 
      <LandingLayout>
     <LandingPage/> 
     </LandingLayout>
     <Toaster />
    </div>
    
  );
}
