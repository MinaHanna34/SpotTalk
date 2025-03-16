'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Link from 'next/link';
import Head from 'next/head';

type Spot = {
  id: number;
  username: string;
  name: string;
  description: string;
  images: string[];
  lat?: number;
  lng?: number;
  stars?: number;
  comments?: string[];
};

type StoryClientProps = {
  id: string;
};

export default function StoryClient({ id }: StoryClientProps) {
  const [story, setStory] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchStory = async () => {
      if (!id) {
        setError('Story ID is required');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching story with ID:', id);
        const response = await fetch(`https://api.canbyr.com/spots/${id}`);
        
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Story not found' : 'Failed to load story');
        }
        
        const data = await response.json();
        console.log('Received story data:', data);
        setStory(data);
      } catch (error) {
        console.error('Error fetching story:', error);
        setError(error instanceof Error ? error.message : 'Failed to load story details');
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id]);

  const nextImage = () => {
    if (story?.images && currentImageIndex < story.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error || 'Story not found'}</p>
          <Link href="/">
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{story.name} - Canbyr</title>
      </Head>
      <Navbar />
      
      <div className="max-w-6xl mx-auto mt-8 p-6">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Stories
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative h-96">
            {story.images && story.images.length > 0 ? (
              <>
                <img
                  src={story.images[currentImageIndex]}
                  alt={`${story.name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {story.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-4">
                    <button
                      onClick={previousImage}
                      disabled={currentImageIndex === 0}
                      className={`rounded-full w-10 h-10 flex items-center justify-center bg-white/80 ${
                        currentImageIndex === 0 ? 'text-gray-400' : 'text-gray-800 hover:bg-white'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={currentImageIndex === story.images.length - 1}
                      className={`rounded-full w-10 h-10 flex items-center justify-center bg-white/80 ${
                        currentImageIndex === story.images.length - 1 ? 'text-gray-400' : 'text-gray-800 hover:bg-white'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-white/80 px-2 py-1 rounded-md text-sm">
                  {currentImageIndex + 1} / {story.images.length}
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No images available</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{story.name}</h1>
              <p className="text-blue-600 font-medium">Posted by {story.username}</p>
            </div>
            
            <p className="text-gray-700 text-lg mb-6">{story.description}</p>

            {story.lat && story.lng && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Location</h2>
                
                  {/* Add map component here */}
            
                
              </div>
            )}

            {story.comments && story.comments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Comments</h2>
                <div className="space-y-4">
                  {story.comments.map((comment, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 