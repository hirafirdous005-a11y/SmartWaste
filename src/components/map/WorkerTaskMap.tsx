'use client';

import React, { useEffect, useRef } from 'react';
import { Navigation, ExternalLink, MapPin } from 'lucide-react';

interface WorkerTaskMapProps {
  latitude: number;
  longitude: number;
  address: string;
  complaintNumber: string;
  priority: string;
}

export const WorkerTaskMap: React.FC<WorkerTaskMapProps> = ({
  latitude,
  longitude,
  address,
  complaintNumber,
  priority,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 16,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Task Target Marker
      const targetIcon = L.divIcon({
        className: 'worker-target-marker',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 40px; height: 40px; background: rgba(225, 29, 72, 0.35); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width: 32px; height: 32px; background: #e11d48; border: 3px solid white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([latitude, longitude], { icon: targetIcon }).addTo(map);
      marker.bindPopup(`<b>${complaintNumber}</b><br/>${address}`).openPopup();

      mapInstanceRef.current = map;
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, address, complaintNumber]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const osmDirectionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=%3B${latitude}%2C${longitude}`;

  return (
    <div className="space-y-3">
      {/* Map Box */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-300 shadow-sm bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Navigation Buttons for Mobile Sanitation Worker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98"
        >
          <Navigation className="w-4 h-4" />
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-75" />
        </a>

        <a
          href={osmDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-all active:scale-98"
        >
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>Open in OpenStreetMap</span>
          <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-75" />
        </a>
      </div>
    </div>
  );
};
