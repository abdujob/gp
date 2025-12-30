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
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        const fetchAds = async () => {
            setLoading(true);
            const params = new URLSearchParams(searchParams.toString());

            // Handle Address -> Coordinates
            const address = params.get('address');
            if (address && !params.get('lat')) {
                const geo = await geocodeAddress(address);
                if (geo) {
                    params.append('lat', geo.lat.toString());
                    params.append('lng', geo.lng.toString());
                    setCoords(geo);
                }
            } else if (params.get('lat')) {
                setCoords({ lat: parseFloat(params.get('lat')!), lng: parseFloat(params.get('lng')!) });
            }

            try {
                const res = await api.get(`/ads?${params.toString()}`);
                // API returns { data: [], pagination: {} }
                setAds(res.data.data || []);
                setPagination(res.data.pagination || { total: 0, pages: 1, limit: 10, page: 1 });
            } catch (err) {
                console.error("Search failed", err);
                setAds([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, [searchParams]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Résultats pour votre recherche</h1>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
                {/* List View */}
                <div className="w-full lg:w-1/2 overflow-y-auto pr-2 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-gray-700">{pagination.total} Annonces</h2>
                        <span className="text-sm text-gray-500">Page {pagination.page} / {pagination.pages}</span>
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
                                <AdCard key={ad.id} ad={ad} />
                            )) : (
                                <p className="text-gray-500 text-center py-10">Aucune annonce trouvée.</p>
                            )}

                            {/* Simple Pagination */}
                            {pagination.pages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.set('page', (pagination.page - 1).toString());
                                            window.location.search = params.toString();
                                        }}
                                        disabled={pagination.page <= 1}
                                        className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                                    >
                                        Précédent
                                    </button>
                                    <button
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams.toString());
                                            params.set('page', (pagination.page + 1).toString());
                                            window.location.search = params.toString();
                                        }}
                                        disabled={pagination.page >= pagination.pages}
                                        className="px-4 py-2 bg-white border rounded disabled:opacity-50"
                                    >
                                        Suivant
                                    </button>
                                </div>
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
