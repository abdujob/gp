'use client';

import { Suspense, useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import api from '../../../lib/api';
import { Calendar, MapPin, Package, User, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Ad {
    id: string;
    title: string;
    description: string;
    user_name: string;
    available_date: string;
    weight_capacity: string;
    price: number;
    transport_type: string;
    address: string;
    city: string;
    avatar_url?: string;
}

function AdDetail() {
    const params = useParams();
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const res = await api.get(`/ads/${params.id}`);
                setAd(res.data);
                setLoading(false);

            } catch (err) {
                console.error(err);
                setError('Annonce introuvable');
                setLoading(false);
            }
        };

        if (params.id) {
            fetchAd();
        }
    }, [params.id]);

    if (loading) return <div className="container mx-auto p-8">Chargement...</div>;
    if (error || !ad) return <div className="container mx-auto p-8 text-red-500">Annonce introuvable</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-primary h-32 md:h-48 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="bg-white p-2 rounded-full shadow-md">
                            {ad.avatar_url ? (
                                <img src={ad.avatar_url} alt={ad.user_name} className="w-24 h-24 rounded-full object-cover" />
                            ) : (
                                <User className="w-24 h-24 text-gray-400 bg-gray-100 rounded-full p-4" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{ad.title}</h1>
                            <p className="text-gray-500 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Proposé par <span className="font-semibold text-primary">{ad.user_name}</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-primary">{ad.price}€</div>
                            <div className="text-sm text-gray-500">par envoi</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Détails du voyage</h3>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                <span>Départ le {format(new Date(ad.available_date), 'd MMMM yyyy', { locale: fr })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <MapPin className="w-5 h-5 text-green-500" />
                                <span>{ad.address}, {ad.city}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Capacité & Type</h3>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Package className="w-5 h-5 text-orange-500" />
                                <span>Type: {ad.transport_type}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <span className="font-bold">Poids max:</span>
                                <span>{ad.weight_capacity}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                        <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                            {ad.description}
                        </p>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button className="bg-primary text-white py-3 px-8 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                            Contacter {ad.user_name}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <AdDetail />
        </Suspense>
    );
}
