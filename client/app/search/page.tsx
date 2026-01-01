'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchForm from '../../components/SearchForm';
import AdCard from '../../components/AdCard';
import AdMap from '../../components/AdMap';
import api from '../../lib/api';
import { geocodeAddress } from '../../lib/utils';

function SearchContent() {
    const searchParams = useSearchParams();
    const [ads, setAds] = useState([]);
    const [searchInfo, setSearchInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        const fetchAds = async () => {
            setLoading(true);

            const depart = searchParams.get('depart');
            const arrivee = searchParams.get('arrivee');
            const date = searchParams.get('date');
            const type = searchParams.get('type');

            try {
                // Utiliser la nouvelle route smart-search
                const res = await api.get('/ads/smart-search', {
                    params: { depart, arrivee, date, type }
                });

                setAds(res.data.results || []);
                setSearchInfo({
                    type: res.data.searchType,
                    message: res.data.message,
                    total: res.data.total,
                    radius: res.data.radius,
                    dateWindow: res.data.dateWindow
                });
            } catch (err) {
                console.error("Search failed", err);
                setAds([]);
                setSearchInfo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, [searchParams]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Résultats pour votre recherche</h1>

            {/* Message contextuel */}
            {searchInfo?.message && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-800">{searchInfo.message}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                {/* List View */}
                <div className="w-full lg:w-1/2 overflow-y-auto pr-2 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-700">
                            {searchInfo?.total || 0} Annonce{(searchInfo?.total || 0) > 1 ? 's' : ''}
                        </h2>
                        {searchInfo?.type && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                                {searchInfo.type === 'exact' && '✓ Correspondance exacte'}
                                {searchInfo.type === 'proximity_geo' && `📍 Rayon ${searchInfo.radius}km`}
                                {searchInfo.type === 'proximity_date' && `📅 ±${searchInfo.dateWindow}j`}
                                {searchInfo.type === 'fallback' && '🔍 Résultats larges'}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 pb-20">
                            {ads.length > 0 ? ads.map((ad: any) => (
                                <AdCard
                                    key={ad.id}
                                    ad={ad}
                                    showRelevance={searchInfo?.type !== 'exact'}
                                />
                            )) : (
                                <p className="text-gray-500 text-center py-10">Aucune annonce trouvée.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Map View */}
                <div className="w-full lg:w-1/2 bg-gray-100 rounded-xl sticky top-20 h-full hidden lg:block overflow-hidden relative">
                    <AdMap ads={ads} center={coords} />
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="bg-blue-600 py-8 px-4 shadow-md z-10">
                <div className="container mx-auto">
                    <div className="transform scale-90 origin-top">
                        <SearchForm />
                    </div>
                </div>
            </div>
            <Suspense fallback={<div className="container mx-auto px-4 py-8">Chargement de la recherche...</div>}>
                <SearchContent />
            </Suspense>
        </div>
    );
}
