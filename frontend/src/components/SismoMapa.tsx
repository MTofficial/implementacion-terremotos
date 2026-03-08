import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// fix para que los iconos carguen correctamente 
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Definicion de los datos del componente 
interface SismoMapaProps {
  sismos: {
    id: number;
    location: string;
    magnitude: number;
    latitude: number;
    longitude: number;
  }[];
}

export default function SismoMapa({ sismos }: SismoMapaProps) {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-sm border border-slate-200 mb-10 relative z-0">
      {/* Centrar el mapa en la ubicacion de chile */}
      <MapContainer center={[-35.67, -71.54]} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        
        {/*Recorrer la lista y poner el marcador para cada uno */}
        {sismos.map(s => (
          <Marker key={s.id} position={[s.latitude, s.longitude]}>
            <Popup>
              <div className="font-sans">
                <strong className="text-slate-800 block mb-1">{s.location}</strong>
                <span className="text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  {s.magnitude} Richter
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}