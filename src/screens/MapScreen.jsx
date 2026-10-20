import { useMemo, useState, useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { SkylineHero } from '../components/SkylineHero'
import { PostCard } from '../components/PostCard'
import { getRouteColor, triggerHaptic } from '../theme'

// Fly-to controller inside MapContainer
function MapFlyController({ targetPosition }) {
  const map = useMap()
  useEffect(() => {
    if (targetPosition) {
      map.flyTo(targetPosition, 14, { duration: 1.2, easeLinearity: 0.25 })
    }
  }, [targetPosition, map])
  return null
}

function createCustomStationIcon(color = '#0057b7') {
  return L.divIcon({
    className: 'custom-station-pin',
    html: `
      <div style="
        position: relative;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${color};
          opacity: 0.3;
          animation: pulse-dot 1.4s infinite ease-in-out;
        "></div>
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid ${color};
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  })
}

export function MapScreen({ stations = [], posts = [], routesById = {}, feedProps }) {
  const [selected, setSelected] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    const matcher = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setIsDark(e.matches)
    matcher.addEventListener('change', handler)
    return () => matcher.removeEventListener('change', handler)
  }, [])

  const center = useMemo(() => {
    if (!stations.length) return [19.076, 72.8777]
    const lat = stations.reduce((a, s) => a + Number(s.lat), 0) / stations.length
    const lng = stations.reduce((a, s) => a + Number(s.lng), 0) / stations.length
    return [lat, lng]
  }, [stations])

  const stationPosts = selected ? posts.filter((p) => p.station_id === selected.id) : []

  // CARTO basemap styles: Dark Matter or Positron Voyager
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'

  return (
    <>
      <SkylineHero
        eyebrow="NETWORK GEOMETRY"
        title="THE CITY, ONE STOP"
        italic="at a time"
        sub="Tap a station marker to read the live dispatches tagged to its platform."
      />

      {stations.length > 0 && (
        <div className="mb-4" style={{ position: 'relative' }}>
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '48vh', minHeight: '340px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>'
              url={tileUrl}
            />

            <MapFlyController targetPosition={flyTarget} />

            {stations.map((s, idx) => {
              const iconColor = getRouteColor(s.id, idx).hex
              return (
                <Marker
                  key={s.id}
                  position={[Number(s.lat), Number(s.lng)]}
                  icon={createCustomStationIcon(iconColor)}
                  eventHandlers={{
                    click: () => {
                      setSelected(s)
                      setFlyTarget([Number(s.lat), Number(s.lng)])
                      triggerHaptic('medium')
                    },
                  }}
                >
                  <Popup>
                    <div style={{ padding: '4px 6px', textAlign: 'center' }}>
                      <div className="signage-heading" style={{ fontSize: 16, marginBottom: 2 }}>
                        {s.name}
                      </div>
                      <div className="mono-spec text-muted" style={{ fontSize: 10 }}>
                        {Number(s.lat).toFixed(4)}, {Number(s.lng).toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      )}

      {selected ? (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: 'var(--line-persimmon)',
                }}
              />
              <h2 className="signage-heading" style={{ fontSize: 24, margin: 0 }}>
                {selected.name}
              </h2>
            </div>
            <span className="mono-spec text-muted" style={{ fontSize: 11 }}>
              {stationPosts.length} {stationPosts.length === 1 ? 'DISPATCH' : 'DISPATCHES'}
            </span>
          </div>

          {stationPosts.length === 0 && (
            <div className="transit-card" style={{ textAlign: 'center', padding: '24px' }}>
              <p className="text-muted small mb-0">
                No commuter posts tagged to {selected.name} yet.
              </p>
            </div>
          )}

          {stationPosts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              routeName={routesById[p.route_id]}
              likeCount={feedProps.likes.counts[p.id] || 0}
              liked={feedProps.likes.mine.has(p.id)}
              comments={feedProps.commentsByPost[p.id] || []}
              onLike={feedProps.onLike}
              onComment={feedProps.onComment}
              onReport={feedProps.onReport}
              onReportComment={feedProps.onReportComment}
            />
          ))}
        </section>
      ) : (
        <div className="transit-card" style={{ textAlign: 'center', padding: '20px' }}>
          <p className="mono-spec text-muted small mb-0">
            ▲ TAP ANY STATION MARKER ON THE GRID TO VIEW PLATFORM DISPATCHES
          </p>
        </div>
      )}
    </>
  )
}
