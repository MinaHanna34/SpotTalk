'use client';

import React, { useState, useEffect } from 'react';

const Sidebar = ({ currentLocation, markers, setSelectedMarker }) => {
  const [distance, setDistance] = useState(10); // Default distance in miles
  const [filteredMarkers, setFilteredMarkers] = useState([]);

  useEffect(() => {
    if (!currentLocation || markers.length === 0) return;

    // Haversine formula to calculate distance between two coordinates
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 3958.8; // Radius of Earth in miles
      const toRad = (angle) => (angle * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Filter markers within the specified distance
    const nearbyMarkers = markers.filter((marker) => {
      const distanceToMarker = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        marker.lat,
        marker.lng
      );
      return distanceToMarker <= distance;
    });

    setFilteredMarkers(nearbyMarkers);
  }, [currentLocation, markers, distance]);

  return (
    <div className="w-80 h-screen bg-gray-100 p-4 overflow-y-auto shadow-md">
      <h2 className="text-lg font-bold mb-4">Nearby Events</h2>
      <div className="mb-4">
        <label htmlFor="distance" className="block text-sm font-medium">
          Filter by Distance (miles):
        </label>
        <input
          type="number"
          id="distance"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full p-2 border rounded mt-2"
        />
      </div>
      {filteredMarkers.length > 0 ? (
        <ul>
          {filteredMarkers.map((marker) => (
            <li
              key={marker.id}
              className="p-4 mb-4 bg-white rounded shadow hover:bg-gray-200 cursor-pointer"
              onClick={() => setSelectedMarker(marker)}
            >
              <h3 className="font-bold text-md">{marker.name || 'Unnamed Event'}</h3>
              <p className="text-sm text-gray-600">
                {marker.description || 'No description available.'}
              </p>
              <p className="text-sm font-medium mt-1">
                Rating: {marker.stars || 0}/5
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No events found within {distance} miles.</p>
      )}
    </div>
  );
};

export default Sidebar;
