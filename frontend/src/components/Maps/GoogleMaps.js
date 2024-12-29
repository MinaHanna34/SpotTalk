'use client';

import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const GoogleMaps = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [currentLocation, setCurrentLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [newSpot, setNewSpot] = useState(null);

  // Fetch existing markers from the backend
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await fetch('https://backend-5qjpq8rpd-minas-projects-7b1e7949.vercel.app');
        const data = await response.json();
        setMarkers(
          data.filter(
            (marker) =>
              typeof marker.lat === 'number' && typeof marker.lng === 'number'
          )
        );
      } catch (err) {
        console.error('Error fetching markers:', err);
      }
    };

    fetchMarkers();
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setCurrentLocation({ lat: 37.7749, lng: -122.4194 }); // Default to San Francisco
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error('Geolocation not supported by this browser.');
      setCurrentLocation({ lat: 37.7749, lng: -122.4194 }); // Default to San Francisco
    }
  }, []);

  const handleMapClick = (event) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat && lng) {
      setNewSpot({ lat, lng, username: 'Anonymous', image: null, comments: [], stars: 0 });
    }
  };

  const handleAddSpot = async () => {
    try {
      const response = await fetch('https://backend-5qjpq8rpd-minas-projects-7b1e7949.vercel.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpot),
      });
      if (response.ok) {
        const savedSpot = await response.json();
        setMarkers((prev) => [...prev, savedSpot.spot]);
        setNewSpot(null);
      } else {
        console.error('Error adding spot');
      }
    } catch (err) {
      console.error('Error adding spot:', err);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="h-screen">
      <GoogleMap
        zoom={currentLocation ? 12 : 3}
        center={currentLocation || { lat: 0, lng: 0 }}
        mapContainerStyle={{ width: '100%', height: '100vh' }}
        onClick={handleMapClick}
      >
        {/* Marker for the user's current location */}
        {currentLocation && (
          <Marker
            position={currentLocation}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
          />
        )}

        {/* Event markers as red */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
            onClick={() => setSelectedMarker(marker)}
          />
        ))}

        {newSpot && (
          <InfoWindow
            position={{ lat: newSpot.lat, lng: newSpot.lng }}
            onCloseClick={() => setNewSpot(null)}
          >
            <div>
              <h3>Add a New Spot</h3>
              <p>Username: {newSpot.username}</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewSpot((prev) => ({
                    ...prev,
                    image: URL.createObjectURL(e.target.files[0]),
                  }))
                }
              />
              <button onClick={handleAddSpot} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
                Save Spot
              </button>
            </div>
          </InfoWindow>
        )}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h3>{selectedMarker.username || 'Anonymous'}</h3>
              {selectedMarker.image_url && (
                <img src={selectedMarker.image_url} alt="Spot" style={{ width: '100px', height: '100px' }} />
              )}
              <div>
                <h4>Comments</h4>
                {selectedMarker.comments.map((comment, idx) => (
                  <p key={idx}>{comment}</p>
                ))}
              </div>
              <p>Stars: {selectedMarker.stars}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMaps;
