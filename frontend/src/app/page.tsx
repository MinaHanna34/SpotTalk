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
  latitude?: number;
  longitude?: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function Home() {
  const [stories, setStories] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [city, setCity] = useState<string>("");
  const storiesPerPage = 6;

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          // Get city name from coordinates using reverse geocoding
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
            );
            const data = await response.json();
            setCity(data.city || "your area");
          } catch (error) {
            console.error("Error getting city:", error);
            setCity("your area");
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setCity("Featured Stories");
          fetchRandomSpots();
        }
      );
    } else {
      fetchRandomSpots();
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbySpots();
    }
  }, [userLocation]);

  const fetchNearbySpots = async () => {
    try {
      setLoading(true);
      // In a real app, you would send the coordinates to get nearby spots
      // For now, we'll just fetch all spots since the API doesn't support location filtering
      const response = await fetch("https://api.canbyr.com/spots");
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
      console.error("Error fetching nearby stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomSpots = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api.canbyr.com/spots");
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
      console.error("Error fetching random stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextPage = () => {
    if ((currentPage + 1) * storiesPerPage < stories.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentStories = stories.slice(
    currentPage * storiesPerPage,
    (currentPage + 1) * storiesPerPage
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Head>
        <title>Canbyr</title>
      </Head>
      <Navbar />
      
    

      <div className="p-6 max-w-7xl mx-auto w-full mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-800">
            {userLocation ? `Stories in ${city}` : 'Featured Stories'}
          </h2>
          <div className="flex gap-4">
            <button 
              onClick={previousPage}
              disabled={currentPage === 0}
              className={`rounded-full w-10 h-10 flex items-center justify-center border ${
                currentPage === 0 ? 'text-gray-400 border-gray-200' : 'text-gray-600 border-gray-400 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={nextPage}
              disabled={(currentPage + 1) * storiesPerPage >= stories.length}
              className={`rounded-full w-10 h-10 flex items-center justify-center border ${
                (currentPage + 1) * storiesPerPage >= stories.length ? 'text-gray-400 border-gray-200' : 'text-gray-600 border-gray-400 hover:bg-gray-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentStories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden group"
              >
                <Link href={`/story/${story.id}`} className="cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    {story.images.length > 0 ? (
                      <img
                        src={story.images[0]}
                        alt={story.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-blue-600 font-medium mb-2">{story.username}</p>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{story.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{story.description}</p>
                    <div className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition text-center border border-gray-200">
                      View Full Story
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
        
        {stories.length === 0 && !loading && (
          <p className="text-center text-gray-500 mt-4">No stories available at this time.</p>
        )}
      </div>

      <div className="p-6 bg-white max-w-6xl mx-auto rounded-lg shadow-md my-6 text-center">
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
