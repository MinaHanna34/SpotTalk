import Navbar from "@/components/Navbar/Navbar";

export default function AboutPage() {
  return (
    <div>
      {/* Include the Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-4">About Us</h1>
        <p className="text-lg text-gray-700">
          SpotTalk is a platform that fosters seamless communication. Learn more
          about our mission, vision, and features here!
        </p>
      </div>
    </div>
  );
}
