'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';
import { Trash2, Edit, Eye, Plus } from 'lucide-react';
import ProtectedRoute from '../../../components/ProtectedRoute';

function MyAdsPageContent() {
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAds = async () => {
        try {
            const res = await api.get('/ads/my');
            setAds(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cette annonce ?')) return;
        try {
            await api.delete(`/ads/${id}`);
            setAds(ads.filter(ad => ad.id !== id));
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Erreur lors de la suppression");
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Mes Annonces</h1>
                <Link href="/post-ad" className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    Créer une annonce
                </Link>
            </div>

            {ads.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore publié d'annonce.</p>
                    <Link href="/post-ad" className="text-primary font-semibold hover:underline">
                        Commencez maintenant
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {ads.map((ad) => (
                        <div key={ad.id} className="bg-white p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-lg">{ad.title}</h3>
                                <div className="text-sm text-gray-500 flex gap-4 mt-1">
                                    <span>{new Date(ad.available_date).toLocaleDateString()}</span>
                                    <span>{ad.transport_type}</span>
                                    <span className="font-semibold text-gray-900">{ad.price}€</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link href={`/ads/${ad.id}`} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 rounded-lg">
                                    <Eye className="w-5 h-5" />
                                </Link>
                                <Link href={`/ads/edit/${ad.id}`} className="p-2 text-gray-500 hover:text-green-600 bg-gray-50 rounded-lg" title="Modifier">
                                    <Edit className="w-5 h-5" />
                                </Link>
                                <button onClick={() => handleDelete(ad.id)} className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 rounded-lg">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Page protégée - Accessible uniquement aux LIVREUR_GP
 */
export default function MyAdsPage() {
    return (
        <ProtectedRoute requiredRole="LIVREUR_GP">
            <MyAdsPageContent />
        </ProtectedRoute>
    );
}
