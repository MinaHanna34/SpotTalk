import Navbar from "@/components/Navbar/Navbar";
import GoogleMaps from "@/components/Maps/GoogleMaps";
 
export default function map() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

     
      <div className="flex flex-grow">
       
 
       
        <div className="flex-grow">
          <GoogleMaps />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-600 py-4 text-center">
        <p>© 2024 SpotTalk. All rights reserved.</p>
      </footer>
    </div>
  );
}
