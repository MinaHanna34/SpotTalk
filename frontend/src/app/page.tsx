'use client';

import Navbar from "@/components/Navbar/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

type Spot = {
  id: number;
  username: string;
  name: string;
  description: string;
  images: string[];
  lat?: number;
  lng?: number;
  location?: string;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

const stateAbbreviations: { [key: string]: string } = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

const getStateAbbreviation = (state: string): string => {
  // First try direct lookup
  if (state in stateAbbreviations) {
    return stateAbbreviations[state];
  }
  
  // If it's already an abbreviation (2 letters), return as is
  if (state.length === 2 && state === state.toUpperCase()) {
    return state;
  }
  
  // Try to find a matching state name (case-insensitive)
  const stateName = Object.keys(stateAbbreviations).find(
    name => name.toLowerCase() === state.toLowerCase()
  );
  
  if (stateName) {
    return stateAbbreviations[stateName];
  }
  
  // If no match found, return original value
  return state;
};

const fetchLocationForSpot = async (spot: Spot): Promise<string> => {
  if (!spot.lat || !spot.lng) return '';
  
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${spot.lat}&longitude=${spot.lng}`
    );
    const data = await response.json();
    const state = getStateAbbreviation(data.principalSubdivision || 'Unknown State');
    return `${data.city || 'Unknown City'}, ${state}`;
  } catch (error) {
    console.error('Error getting location:', error);
    return '';
  }
};

export default function Home() {
  const [stories, setStories] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [city, setCity] = useState<string>("");
  const [zipCode, setZipCode] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const storiesPerPage = 6;

  const handleLocationSearch = async (zip: string) => {
    setIsSearching(true);
    try {
      // Convert ZIP to coordinates using a geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en&postcode=${zip}`
      );
      const data = await response.json();
      if (data.latitude && data.longitude) {
        setUserLocation({
          latitude: data.latitude,
          longitude: data.longitude,
        });
        setCity(data.city || zip);
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setCity("Featured Stories");
    } finally {
      setIsSearching(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
            );
            const data = await response.json();
            setCity(data.city || "your area");
          } catch (error) {
            console.error("Error getting city:", error);
            setCity("your area");
          } finally {
            setIsSearching(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setCity("Featured Stories");
          setIsSearching(false);
          fetchRandomSpots();
        }
      );
    } else {
      fetchRandomSpots();
    }
  };

  useEffect(() => {
    fetchRandomSpots();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbySpots();
    }
  }, [userLocation]);

  const fetchNearbySpots = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://api.canbyr.com/spots");
      const data = await response.json();
      
      // Process each spot to include location
      const spotsWithLocation = await Promise.all(
        data.map(async (spot: Spot) => {
          const location = await fetchLocationForSpot(spot);
          return {
            id: spot.id,
            username: spot.username || "Anonymous",
            name: spot.name || "Unnamed Event",
            description: spot.description || "No description available.",
            images: Array.isArray(spot.images) ? spot.images : [],
            lat: spot.lat,
            lng: spot.lng,
            location
          };
        })
      );
      
      setStories(spotsWithLocation);
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
      
      // Process each spot to include location
      const spotsWithLocation = await Promise.all(
        data.map(async (spot: Spot) => {
          const location = await fetchLocationForSpot(spot);
          return {
            id: spot.id,
            username: spot.username || "Anonymous",
            name: spot.name || "Unnamed Event",
            description: spot.description || "No description available.",
            images: Array.isArray(spot.images) ? spot.images : [],
            lat: spot.lat,
            lng: spot.lng,
            location
          };
        })
      );
      
      setStories(spotsWithLocation);
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
        <title>Canbyr - Share Your Stories</title>
      </Head>
      <Navbar />
      
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="absolute inset-0">
          <Image
            src="/handle1.jpg"
            alt="Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/75 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Discover Stories Near You</h1>
            <p className="text-xl mb-8">Find and share experiences in your community</p>
            
            <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-center">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Enter ZIP code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleLocationSearch(zipCode)}
                  disabled={!zipCode || isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Search
                </button>
              </div>
              <button
                onClick={getUserLocation}
                disabled={isSearching}
                className="px-6 py-3 bg-white text-blue-800 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Use My Location
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {isSearching ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Searching...
              </div>
            ) : (
              `Stories in ${city || 'Featured Stories'}`
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
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
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{story.name}</h3>
                        {story.location && (
                          <p className="text-gray-600 text-sm mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {story.location}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-blue-600 font-medium">By {story.username}</p>
                    </div>
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
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-xl font-semibold">No stories available</p>
              <p className="text-gray-500">Be the first to share a story in this area!</p>
            </div>
            <Link href="/map">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                Share Your Story
              </button>
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Share Your Story?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join our community and help raise awareness by sharing your experiences.
            </p>
            <Link href="/map">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105">
                Create Your Story
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
