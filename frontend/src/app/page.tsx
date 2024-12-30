'use client';

import Navbar from "@/components/Navbar/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";

type Spot = {
  id: number;
  name: string;
  description: string;
  images: string[];
};

export default function Home() {
  const [stories, setStories] = useState<Spot[]>([]); // Use the Spot type here

  useEffect(() => {
    // Fetch events from your backend
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/spots"); // Replace with your API URL
        const data = await response.json();
        setStories(
          data.map((spot: any) => ({
            id: spot.id,
            name: spot.name || "Unnamed Event",
            description: spot.description || "No description available.",
            images: Array.isArray(spot.images) ? spot.images : [],
          }))
        );
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-200">
      <Navbar />
      <div className="p-6 bg-white max-w-4xl mx-auto rounded-lg shadow-md mt-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">About SpotTalk</h1>
        <p className="text-lg text-gray-700 text-center">
          SpotTalk is a platform dedicated to honoring the lives of individuals who tragically lost their lives on the road.
          Our app allows users to view the locations where these incidents occurred, displayed on an interactive map.
          On the sidebar, users can find detailed information about each individual, helping us remember them and their stories forever.
        </p>
        <p className="text-lg text-gray-700 text-center mt-4">
          By preserving these memories, we hope to foster a sense of awareness and reflection, encouraging safer roads for everyone.
          Together, we can ensure that their legacies live on.
        </p>
      </div>
      <div className="p-6 bg-white max-w-6xl mx-auto rounded-lg shadow-md mt-6">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">Stories</h2>
        <div className="space-y-6">
          {stories.slice(0, 3).map((story) => (
            <div key={story.id} className="bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{story.name}</h3>
              <p className="text-md text-gray-700 mb-4">{story.description}</p>
              {story.images.length > 0 && (
                <img
                  src={story.images[0]}
                  alt={story.name}
                  className="w-40 h-40 object-cover rounded-md mx-auto"
                />
              )}
            </div>
          ))}
        </div>
        {stories.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No stories available at this time.</p>
        )}
      </div>
      <div className="p-6 bg-white max-w-6xl mx-auto rounded-lg shadow-md mt-6 text-center">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">Ready to Post a Story?</h2>
        <p className="text-lg text-gray-700 mb-4">
          Share your experience or explore more stories. Together, we can honor the memories of loved ones and raise awareness.
        </p>
        <Link href="/map">
  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
    Explore Now
  </button>
</Link>

      </div>
    </div>
  );
}
