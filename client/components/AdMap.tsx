'use client';

import { useEffect, useState } from 'react';
/* 
 * We use dynamic import for the map to avoid SSR issues with Leaflet window object requirements.
 * However, since we are inside 'use client', we can't easily dynamic import directly inside the component body 
 * in a way that React likes without a separate component definition or using next/dynamic outside.
 */
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

import 'leaflet/dist/leaflet.css';

// Remove top-level import of Icon from leaflet which causes SSR ReferenceError
// import { Icon } from 'leaflet';

interface AdMapProps {
    ads: any[];
    center?: { lat: number, lng: number } | null;
}

export default function AdMap({ ads, center }: AdMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [L, setL] = useState<any>(null);

    useEffect(() => {
        setIsMounted(true);
        // Dynamically import leaflet on client only
        import('leaflet').then((leaflet) => {
            setL(leaflet);

            // Fix default icon issues
            // We can do this globally or per icon.
            // @ts-ignore
            delete leaflet.Icon.Default.prototype._getIconUrl;

            leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
        });
    }, []);

    if (!isMounted || !L) {
        return <div className="w-full h-full bg-gray-100 flex items-center justify-center">Chargement de la carte...</div>;
    }

    const defaultCenter: [number, number] = [46.603354, 1.888334]; // France
    const mapCenter: [number, number] = center ? [center.lat, center.lng] : defaultCenter;
    const zoom = center ? 10 : 5;

    // Use default icon (fixed via mergeOptions)

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }} key={`${mapCenter[0]}-${mapCenter[1]}`}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {ads.map((ad) => (
                    ad.latitude && ad.longitude ? (
                        <Marker key={ad.id} position={[ad.latitude, ad.longitude]}>
                            <Popup>
                                <div className="font-sans">
                                    <h3 className="font-bold">{ad.title}</h3>
                                    <p className="text-sm">{ad.price}€ - {ad.weight_capacity}</p>
                                    <a href={`/ads/${ad.id}`} className="text-blue-500 hover:underline text-xs">Voir détail</a>
                                </div>
                            </Popup>
                        </Marker>
                    ) : null
                ))}
            </MapContainer>
        </div>
    );
}
