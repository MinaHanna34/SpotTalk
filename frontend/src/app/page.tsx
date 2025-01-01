'use client';

import Navbar from "@/components/Navbar/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";

type Spot = {
  id: number;
  username: string;

  name: string;
  description: string;
  images: string[];
};

export default function Home() {
  const [stories, setStories] = useState<Spot[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("https://api.canbyr.com/spots"); // Updated to HTTPS
        const data = await response.json();
        setStories(
          data.map((spot: Spot) => ({
            id: spot.id,
            username: spot.username || "Anonymous",

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
            <Head>
        <title>Canbyr </title>
      </Head>
      <Navbar />
      <div className="p-6 bg-white max-w-4xl mx-auto rounded-lg shadow-md mt-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-800">About Canbyr</h1>
        <p className="text-lg text-gray-700 text-center">
        Canbyr is a platform dedicated to honoring the lives of individuals who tragically lost their lives on the road.
          Our app allows users to view the locations where these incidents occurred, displayed on an interactive map.
          On the sidebar, users can find detailed information about each individual, helping us remember them and their stories forever.
        </p>
   
      </div>
      <div className="p-6 bg-white max-w-4xl mx-auto rounded-lg shadow-md mt-6">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Stories</h2>
        <div className="space-y-6">
          {stories.slice(10, 13).map((story, index) => (
            <div
              key={story.id}
              className={`bg-gray-50 p-6 rounded-lg shadow hover:shadow-lg transition duration-700 animate-slide-in`}
              style={{ animationDelay: `${index * 0.3}s` }} // Delay each story slightly
            >
              <p className="text-md font-semibold text-gray-600 mb-2">
                <span className="text-gray-800">Username:</span> {story.username}
              </p>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                <span className="text-gray-800">Title:</span> {story.name}
              </h3>
              <p className="text-md text-gray-700 mb-4">
                <span className="text-gray-800">Description:</span> {story.description}
              </p>
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
