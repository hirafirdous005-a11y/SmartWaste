'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Locate, MapPin, Search, AlertTriangle, Check } from 'lucide-react';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  address: string;
  onLocationChange: (lat: number, lng: number, addressText: string) => void;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Reverse geocode lat, lng to address using OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          onLocationChange(lat, lng, data.display_name);
          return;
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding failed:', e);
    }
    // Fallback if network offline or throttled
    onLocationChange(lat, lng, `GPS Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  };

  // Search address by text
  const handleAddressSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        {
          headers: { 'Accept-Language': 'en' },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([newLat, newLng], 16);
          }
          if (markerRef.current) {
            markerRef.current.setLatLng([newLat, newLng]);
          }
          onLocationChange(newLat, newLng, data[0].display_name);
        } else {
          setGpsError('Address not found. Try dragging the pin on the map.');
        }
      }
    } catch (e) {
      setGpsError('Address search request failed.');
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch Browser GPS location
  const handleFetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGpsLoading(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        await reverseGeocode(lat, lng);
      },
      (error) => {
        setGpsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Location permission denied. Please enable GPS permissions or drag the pin manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('Location information is currently unavailable. Please adjust pin on map.');
            break;
          case error.TIMEOUT:
            setGpsError('Location request timed out. Please try again or drag the pin.');
            break;
          default:
            setGpsError('An unknown error occurred while retrieving GPS coordinates.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean existing instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom high-contrast draggable marker icon
      const pinIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
            <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(16, 185, 129, 0.35); border-radius: 9999px; animation: pulse 2s infinite;"></div>
            <div style="position: relative; width: 32px; height: 32px; background: #059669; border: 2.5px solid white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 36],
      });

      const marker = L.marker([latitude, longitude], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup('<b>Selected Waste Spot</b><br/>Drag to fine-tune exact location');

      // Drag listener
      marker.on('dragend', async (e: any) => {
        const position = e.target.getLatLng();
        await reverseGeocode(position.lat, position.lng);
      });

      // Click on map to place pin
      map.on('click', async (e: any) => {
        marker.setLatLng(e.latlng);
        await reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Top action bar: Address search + Auto GPS Button */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search landmark, street, or ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
            className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <button
            type="button"
            onClick={handleAddressSearch}
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleFetchCurrentLocation}
          disabled={gpsLoading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-70 whitespace-nowrap"
        >
          <Locate className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
          {gpsLoading ? 'Detecting GPS...' : 'Auto-Detect My GPS'}
        </button>
      </div>

      {gpsError && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Notice: </span>
            {gpsError}
          </div>
        </div>
      )}

      {/* Interactive Map Box */}
      <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-2 left-2 z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 shadow-xs flex items-center gap-1.5 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Click anywhere or drag pin to adjust location</span>
        </div>
      </div>

      {/* Selected Coordinates & Address Preview */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-700 truncate">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate font-medium">{address || 'No location selected yet'}</span>
        </div>
        <div className="text-[11px] font-mono text-slate-500 shrink-0 bg-white px-2 py-1 rounded-md border border-slate-200">
          Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
        </div>
      </div>
    </div>
  );
};
