'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WasteReport, ComplaintStatus, ComplaintPriority } from '@/lib/types';
import { Filter, Layers, Flame, MapPin, Eye, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface AdminMapProps {
  reports: WasteReport[];
  onSelectReport?: (report: WasteReport) => void;
}

export const AdminMap: React.FC<AdminMapProps> = ({ reports, onSelectReport }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const hotspotsLayerRef = useRef<any>(null);

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [showHotspots, setShowHotspots] = useState(true);

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && r.priority !== priorityFilter) return false;
    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Default center around Mumbai or first report
      const defaultLat = reports[0]?.latitude || 19.0760;
      const defaultLng = reports[0]?.longitude || 72.8777;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // CartoDB Positron / OSM style
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      const hotspotsGroup = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = markersGroup;
      hotspotsLayerRef.current = hotspotsGroup;

      renderMarkers(L, map, markersGroup, hotspotsGroup);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when filters or reports change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      if (markersLayerRef.current && hotspotsLayerRef.current) {
        renderMarkers(L, mapInstanceRef.current, markersLayerRef.current, hotspotsLayerRef.current);
      }
    });
  }, [filteredReports, showHotspots]);

  const renderMarkers = (L: any, map: any, markersGroup: any, hotspotsGroup: any) => {
    markersGroup.clearLayers();
    hotspotsGroup.clearLayers();

    if (filteredReports.length === 0) return;

    // 1. Draw markers for each complaint
    filteredReports.forEach((r) => {
      const getPinColor = () => {
        if (r.status === 'Resolved') return '#10b981'; // emerald
        if (r.priority === 'Emergency') return '#e11d48'; // red
        if (r.priority === 'High') return '#ea580c'; // orange
        if (r.status === 'In Progress') return '#6366f1'; // indigo
        return '#0284c7'; // blue
      };

      const pinColor = getPinColor();

      const markerHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${
            r.priority === 'Emergency'
              ? '<div style="position: absolute; width: 44px; height: 44px; background: rgba(225, 29, 72, 0.3); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>'
              : ''
          }
          <div style="width: 28px; height: 28px; background: ${pinColor}; border: 2.5px solid white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.25);">
            <div style="width: 10px; height: 10px; background: white; border-radius: 9999px;"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'admin-marker-pin',
        html: markerHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([r.latitude, r.longitude], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; width: 230px; font-size: 12px; color: #1e293b; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #0f172a; font-size: 13px;">${r.complaint_number}</span>
            <span style="padding: 2px 6px; border-radius: 9999px; font-size: 10px; font-weight: 600; background: #f1f5f9; color: #475569;">${r.status}</span>
          </div>
          <img src="${r.image_url}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <div style="margin-bottom: 4px;">
            <strong style="color: #059669;">Category:</strong> ${r.predicted_category}
            <span style="color: #64748b; font-size: 10px;">(${r.ai_confidence}% AI)</span>
          </div>
          <div style="margin-bottom: 6px; color: #475569; font-size: 11px; line-clamp: 2; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;">
            ${r.description}
          </div>
          <div style="padding-top: 6px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: #94a3b8;">${r.priority} Priority</span>
            <span style="font-size: 11px; color: #059669; font-weight: 600;">${r.assigned_worker_name || 'Unassigned'}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260 });
      marker.addTo(markersGroup);
    });

    // 2. Draw Hotspot clusters (Areas with high complaint concentration)
    if (showHotspots) {
      // Calculate dense points
      const clusterCenters: { [key: string]: { lat: number; lng: number; count: number } } = {};

      filteredReports.forEach((r) => {
        // Group by roughly ~1km grid
        const key = `${r.latitude.toFixed(2)},${r.longitude.toFixed(2)}`;
        if (!clusterCenters[key]) {
          clusterCenters[key] = { lat: r.latitude, lng: r.longitude, count: 0 };
        }
        clusterCenters[key].count += 1;
      });

      Object.values(clusterCenters).forEach((c) => {
        if (c.count >= 2) {
          const radius = Math.min(600 + c.count * 200, 1500);
          L.circle([c.lat, c.lng], {
            color: '#e11d48',
            fillColor: '#f43f5e',
            fillOpacity: 0.15,
            radius,
            weight: 1.5,
          })
            .bindTooltip(`<b>Waste Hotspot</b>: ${c.count} complaints in this vicinity`, {
              permanent: false,
              direction: 'top',
            })
            .addTo(hotspotsGroup);
        }
      });
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Statuses ({reports.length})</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Priorities</option>
            <option value="Emergency">Emergency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Hotspots Toggle */}
          <button
            type="button"
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              showHotspots
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Hotspots {showHotspots ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-[11px] font-semibold text-slate-700 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600"></span>
            <span>Emergency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-[520px] bg-slate-100" />
    </div>
  );
};
