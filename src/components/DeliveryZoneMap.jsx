import { useEffect, useRef } from 'react'

// ── Paste your full GeoJSON features array here ───────────────────────────────
// Extract from the geo_json_*_add({...}) call in your original HTML file.
// Each entry looks like:
// { "geometry": { "coordinates": [-77.0177, 38.9122], "type": "Point" },
//   "properties": { "City": "Washington", "Distance": 6.68, "ZIP": "20001",
//                   "marker_color": "green", "popup": "..." },
//   "type": "Feature" }
const ZIP_GEOJSON_FEATURES = [
  // PASTE YOUR FEATURES ARRAY HERE
]

const STORE_LAT = 39.0074818
const STORE_LNG = -77.0395937

export default function DeliveryZoneMap() {
  const mapRef         = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (mapInstanceRef.current) return

    const loadScript = (src) =>
      new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
        const s = document.createElement('script')
        s.src = src
        s.onload = resolve
        document.head.appendChild(s)
      })

    const loadLink = (href) => {
      if (document.querySelector(`link[href="${href}"]`)) return
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = href
      document.head.appendChild(l)
    }

    const init = async () => {
      loadLink('https://cdn.jsdelivr.net/npm/leaflet@1.9.3/dist/leaflet.css')
      loadLink('https://cdn.jsdelivr.net/npm/leaflet-search@2.9.7/dist/leaflet-search.min.css')
      loadLink('https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.css')
      loadLink('https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.2.0/css/all.min.css')

      await loadScript('https://cdn.jsdelivr.net/npm/leaflet@1.9.3/dist/leaflet.js')
      await loadScript('https://code.jquery.com/jquery-3.7.1.min.js')
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/Leaflet.awesome-markers/2.0.2/leaflet.awesome-markers.js')
      await loadScript('https://cdn.jsdelivr.net/npm/leaflet-search@2.9.7/dist/leaflet-search.min.js')

      const L = window.L
      if (!mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        center: [STORE_LAT, STORE_LNG],
        zoom: 10,
        zoomControl: true,
      })
      mapInstanceRef.current = map

      // Base tile layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Store marker
      const storeIcon = L.AwesomeMarkers.icon({
        markerColor: 'blue',
        iconColor: 'white',
        icon: 'home',
        prefix: 'glyphicon',
      })
      L.marker([STORE_LAT, STORE_LNG], { icon: storeIcon })
        .bindPopup('<div style="font-weight:600">9332 Georgia Ave<br>Silver Spring, MD 20910</div>')
        .bindTooltip('<div><strong>FANCY CAKES PATISSERIE</strong></div>', { sticky: true })
        .addTo(map)

      // Delivery radius circles
      L.circle([STORE_LAT, STORE_LNG], {
        color: 'green', fillColor: 'green', fillOpacity: 0.15, radius: 24140, weight: 2,
      }).addTo(map)
      L.circle([STORE_LAT, STORE_LNG], {
        color: 'cyan', fillColor: 'cyan', fillOpacity: 0.1, radius: 40233, weight: 2,
      }).addTo(map)
      L.circle([STORE_LAT, STORE_LNG], {
        color: 'red', fillColor: 'red', fillOpacity: 0.07, radius: 64374, weight: 2,
      }).addTo(map)

      if (ZIP_GEOJSON_FEATURES.length === 0) return

      // Style per marker_color
      const styleFeature = (feature) => {
        const color = feature.properties.marker_color || 'red'
        return { color, fillColor: color, fillOpacity: 0.8, weight: 2 }
      }

      const geoLayer = L.geoJson(
        { type: 'FeatureCollection', features: ZIP_GEOJSON_FEATURES },
        {
          style: styleFeature,
          pointToLayer: (feature, latlng) =>
            new L.CircleMarker(latlng, { ...styleFeature(feature), radius: 6, stroke: true, opacity: 1.0 }),
          onEachFeature: (feature, layer) => {
            const p = feature.properties
            layer.bindTooltip(
              `<table>
                <tr><th>ZIP:</th><td>${p.ZIP}</td></tr>
                <tr><th>City:</th><td>${p.City}</td></tr>
              </table>`,
              { sticky: true, className: 'foliumtooltip' }
            )
            layer.bindPopup(
              `<table>
                <tr><th>ZIP:</th><td>${p.ZIP}</td></tr>
                <tr><th>City:</th><td>${p.City}</td></tr>
                <tr><th>Miles:</th><td>${p.Distance}</td></tr>
              </table>`,
              { className: 'foliumpopup' }
            )
          },
        }
      ).addTo(map)

      // ZIP search control
      const searchControl = new L.Control.Search({
        layer: geoLayer,
        propertyName: 'ZIP',
        collapsed: false,
        textPlaceholder: 'Search ZIP...',
        position: 'topleft',
        initial: false,
        hideMarkerOnCollapse: true,
      })
      searchControl.on('search:locationfound', (e) => {
        if (e.layer._popup) e.layer.openPopup()
      })
      map.addControl(searchControl)
    }

    init()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 shadow-md" style={{ height: '480px' }}>
      {/* Map container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend overlay */}
      <div className="absolute bottom-4 right-4 z-1000 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md text-xs space-y-1.5">
        <p className="font-bold text-slate-800 mb-2">Delivery Zones</p>
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500 shrink-0" /> &lt; 15 miles — Free</div>
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-cyan-400 shrink-0" /> 15–25 miles — $5</div>
        <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500 shrink-0" /> 25–40 miles — $10</div>
      </div>

      {/* Tooltip / popup styles */}
      <style>{`
        .foliumtooltip table { margin: auto; }
        .foliumtooltip tr { text-align: left; }
        .foliumtooltip th { padding: 2px; padding-right: 8px; font-weight: 600; }
        .foliumpopup table { margin: auto; }
        .foliumpopup tr { text-align: left; }
        .foliumpopup th { padding: 2px; padding-right: 8px; font-weight: 600; }
      `}</style>
    </div>
  )
}
