'use client'

import React, { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Station } from '@/types/database'
import { useTheme } from '@/hooks/useTheme'

interface TransitMapProps {
  stations: Station[]
  selectedStation: Station | null
  onSelectStation: (station: Station) => void
}

function FlyToStation({ target }: { target: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) {
      map.flyTo(target, 14, { duration: 1.2, easeLinearity: 0.25 })
    }
  }, [target, map])
  return null
}

function createBrassStationIcon(isSelected: boolean) {
  return L.divIcon({
    className: 'brass-station-marker',
    html: `
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${isSelected ? '#7A1F2B' : '#A67C2E'};
          opacity: 0.25;
          transform: scale(${isSelected ? 1.4 : 1});
        "></div>
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${isSelected ? '#7A1F2B' : '#FFFFFF'};
          border: 2.5px solid ${isSelected ? '#FFFFFF' : '#A67C2E'};
          box-shadow: 0 1px 4px rgba(31, 26, 20, 0.35);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export default function TransitMap({
  stations,
  selectedStation,
  onSelectStation,
}: TransitMapProps) {
  const { theme } = useTheme()
  const isDark = theme === 'candlelit'

  const center: [number, number] = useMemo(() => {
    if (!stations.length) return [18.963, 72.825] // Mumbai default
    const lat = stations.reduce((a, s) => a + Number(s.lat), 0) / stations.length
    const lng = stations.reduce((a, s) => a + Number(s.lng), 0) / stations.length
    return [lat, lng]
  }, [stations])

  const flyTarget: [number, number] | null = selectedStation
    ? [Number(selectedStation.lat), Number(selectedStation.lng)]
    : null

  // Muted sepia / Carto tiles
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  return (
    <div className="w-full h-full min-h-[420px] rounded-sm overflow-hidden border border-[var(--rule-color)] relative">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full min-h-[420px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>'
          url={tileUrl}
        />
        <FlyToStation target={flyTarget} />

        {stations.map((s) => {
          const isSelected = selectedStation?.id === s.id
          return (
            <Marker
              key={s.id}
              position={[Number(s.lat), Number(s.lng)]}
              icon={createBrassStationIcon(isSelected)}
              eventHandlers={{
                click: () => onSelectStation(s),
              }}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
