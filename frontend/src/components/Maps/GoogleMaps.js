'use client';

import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

const GoogleMaps = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, // Use an environment variable for security
  });

  const [currentLocation, setCurrentLocation] = useState({ lat: 37.7749, lng: -122.4194 }); // Default to San Francisco
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Could not fetch location');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  if (!isLoaded) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ flex: '1 1 auto', display: 'flex' }}>
      <GoogleMap
        zoom={12}
        center={currentLocation}
        mapContainerStyle={{
          flex: 1, // Use flex to dynamically fill space
          width: '100%', // Full width of the container
          height: '100vh', // 100% of the viewport height
        }}
      >
        <Marker position={currentLocation} />
      </GoogleMap>
    </div>
  );
};

export default GoogleMaps;
