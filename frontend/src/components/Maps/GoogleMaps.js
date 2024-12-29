'use client';

import React, { useState, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const GoogleMaps = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [currentLocation, setCurrentLocation] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [newSpot, setNewSpot] = useState(null);
  const [comment, setComment] = useState('');
  const [eventMode, setEventMode] = useState(false);

  // Fetch existing markers from the backend
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const response = await fetch('https://backend-lemon-chi-68.vercel.app/spots');
        const data = await response.json();
        console.log("Fetched Spots:", data); // Log the fetched spots
        setMarkers(data.filter(marker => typeof marker.lat === 'number' && typeof marker.lng === 'number'));
      } catch (err) {
        console.error('Error fetching markers:', err);
      }
    };
    fetchMarkers();
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        () => {
          setCurrentLocation({ lat: 37.7749, lng: -122.4194 }); // Default to San Francisco
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error('Geolocation not supported by this browser.');
      setCurrentLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, []);

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  const handleMapClick = (event) => {
 
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat && lng) {
      setNewSpot({ lat, lng, username: 'Anonymous', name: '', description: '', stars: 0, images: [], comments: [] });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 3); // Allow up to 3 images
    const readers = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // Keep Base64 string (with metadata)
        reader.onerror = reject;
        reader.readAsDataURL(file); // Convert file to Base64
      });
    });

    Promise.all(readers)
      .then(base64Images => {
        setNewSpot((prev) => ({ ...prev, images: base64Images })); // Save Base64 strings to state
      })
      .catch(err => console.error('Error reading files:', err));
  };

  const handleAddSpot = async () => {
    try {
      const response = await fetch('https://backend-lemon-chi-68.vercel.app/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSpot),
      });

      if (response.ok) {
        const savedSpot = await response.json();

        // Fetch the latest spots from the backend
        const fetchUpdatedMarkers = await fetch('https://backend-lemon-chi-68.vercel.app/spots');
        const updatedMarkers = await fetchUpdatedMarkers.json();

        // Update the markers with the latest data
        setMarkers(updatedMarkers.filter(marker => typeof marker.lat === 'number' && typeof marker.lng === 'number'));

        // Set the newly added spot as the selected marker
        const newSelectedMarker = updatedMarkers.find(marker => marker.id === savedSpot.spot.id);
        setSelectedMarker(newSelectedMarker);

        setNewSpot(null); // Clear the new spot state
      } else {
        console.error('Error adding spot');
      }
    } catch (err) {
      console.error('Error adding spot:', err);
    }
  };

  const handleAddComment = async (spotId) => {
    if (!comment.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const response = await fetch(`https://backend-lemon-chi-68.vercel.app/spots/${spotId}/comments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });

      if (response.ok) {
        const updatedSpot = await response.json();

        // Update the markers state
        setMarkers((prev) =>
          prev.map((marker) =>
            marker.id === updatedSpot.spot.id ? updatedSpot.spot : marker
          )
        );

        // Retain images while updating selectedMarker
        if (selectedMarker && selectedMarker.id === updatedSpot.spot.id) {
          setSelectedMarker((prev) => ({
            ...updatedSpot.spot,
            images: prev.images, // Retain the existing images
          }));
        }

        setComment('');
      } else {
        console.error('Error adding comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div className="h-screen">
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <h1 className="text-lg font-bold">  </h1>
        <button
          onClick={() => setEventMode((prev) => !prev)}
          className={`px-4 py-2 rounded ${eventMode ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
        >
          {eventMode ? 'Disable Event Mode' : 'Enable Event Mode'}
        </button>
      </div>
      <GoogleMap
  zoom={  currentLocation ? 12 : 3}
  center={currentLocation || { lat: 0, lng: 0 }}
  mapContainerStyle={{ width: '100%', height: '100%' }}
  onClick={handleMapClick}
  options={{
    disableDefaultUI: eventMode,         // Hide all controls in event mode
    draggable: !eventMode,              // Disable dragging
    scrollwheel: !eventMode,            // Disable zooming with the scroll wheel
    keyboardShortcuts: !eventMode,      // Disable keyboard shortcuts
    zoomControl: !eventMode,            // Hide zoom control
    clickableIcons: !eventMode,         // Disable clicking POIs
    gestureHandling: eventMode ? 'none' : 'auto', // Disable gestures in event mode
    tilt: 0,                            // Restrict tilt
    heading: 0,                         // Restrict heading (camera rotation)
  }}
>


        {currentLocation && (
          <Marker
            position={currentLocation}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
          />
        )}

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
              <input
                type="text"
                placeholder="Name"
                value={newSpot.name}
                onChange={(e) =>
                  setNewSpot((prev) => ({ ...prev, name: e.target.value }))
                }
                className="border p-2 rounded w-full mb-2"
              />
              <textarea
                placeholder="Description"
                value={newSpot.description}
                onChange={(e) =>
                  setNewSpot((prev) => ({ ...prev, description: e.target.value }))
                }
                className="border p-2 rounded w-full mb-2"
              ></textarea>
              <input
                type="number"
                placeholder="Rating (0-5)"
                value={newSpot.stars}
                onChange={(e) =>
                  setNewSpot((prev) => ({
                    ...prev,
                    stars: Math.min(5, Math.max(0, parseInt(e.target.value) || 0)),
                  }))
                }
                className="border p-2 rounded w-full mb-2"
              />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
              />
              {newSpot.images.map((image, idx) => (
                <img key={idx} src={image} alt={`Upload Preview ${idx}`} className="w-24 h-24 m-2" />
              ))}
              <button onClick={handleAddSpot} className="bg-blue-500 text-white px-4 py-2 rounded">
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
    <div className="w-56 p-3 space-y-3">
      <h3 className="text-md font-semibold text-gray-800 truncate">{selectedMarker.name || 'Unnamed Spot'}</h3>
      <p className="text-xs text-gray-600">
        <span className="font-medium text-gray-700">Description:</span> {selectedMarker.description || 'No description provided.'}
      </p>
      <p className="text-xs text-gray-600">
        <span className="font-medium text-gray-700">Rating:</span> {selectedMarker.stars || 0}/5
      </p>

      {selectedMarker.images && selectedMarker.images.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {selectedMarker.images.map((image, idx) => (
            <img
              key={idx}
              src={image}
              alt={`Spot Image ${idx}`}
              className="w-16 h-16 rounded shadow"
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No images available.</p>
      )}

      <div>
        <h4 className="text-sm font-medium text-gray-700">Comments:</h4>
        <div className="mt-1 space-y-1">
          {selectedMarker.comments.length > 0 ? (
            selectedMarker.comments.map((comment, idx) => (
              <div
                key={idx}
                className="p-1 border rounded bg-gray-50 text-xs text-gray-700 shadow-sm"
              >
                Anonymous: {comment}
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500">No comments yet.</p>
          )}
        </div>
      </div>

      <textarea
        placeholder="Add a comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full p-1 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
      ></textarea>
      <button
        onClick={() => handleAddComment(selectedMarker.id)}
        className="w-full bg-blue-500 text-white px-2 py-1 rounded shadow hover:bg-blue-600 transition text-xs"
      >
        Add Comment
      </button>
    </div>
  </InfoWindow>
)}

      </GoogleMap>
    </div>
  );
};

export default GoogleMaps;
