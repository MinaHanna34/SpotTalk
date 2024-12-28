import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import GoogleMaps from "@/components/Maps/GoogleMaps";

export default function Home() {
  return (
    
    <div className="min-h-screen flex flex-col">
       <Navbar />
      <GoogleMaps/>
 

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-600 py-4 text-center">
        <p>© 2024 SpotTalk. All rights reserved.</p>
      </footer>
    </div>
  );
}
