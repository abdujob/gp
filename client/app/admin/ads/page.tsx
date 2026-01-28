'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';

interface Ad {
    id: string;
    title: string;
    description: string;
    city: string;
    price: number;
    user_name: string;
    user_email: string;
    created_at: string;
}

export default function AdminAdsPage() {
    const router = useRouter();
    const { isAdmin, loading: authLoading } = useAuth();
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        if (isAdmin) {
            loadAds();
        }
    }, [isAdmin, page, search]);

    const loadAds = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/ads?page=${page}&search=${search}`);
            setAds(res.data.data);
            setTotalPages(res.data.pagination.pages);
        } catch (err) {
            console.error('Error loading ads:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer l'annonce "${title}" ?`)) {
            return;
        }

        try {
            await api.delete(`/admin/ads/${id}`);
            alert('Annonce supprimée avec succès');
            loadAds();
        } catch (err: any) {
            alert(err.response?.data?.msg || 'Erreur lors de la suppression');
        }
    };

    if (authLoading || !isAdmin) {
        return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Annonces</h1>
                        <Link href="/admin" className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                            Retour
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Rechercher par titre ou description..."
                        className="w-full px-4 py-2 border rounded-lg"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                {/* Ads Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Titre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ville</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auteur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">Chargement...</td>
                                </tr>
                            ) : ads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">Aucune annonce trouvée</td>
                                </tr>
                            ) : (
                                ads.map((ad) => (
                                    <tr key={ad.id}>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {ad.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{ad.city}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{ad.price} FCFA</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{ad.user_name}</div>
                                            <div className="text-sm text-gray-500">{ad.user_email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(ad.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleDelete(ad.id, ad.title)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                        >
                            Précédent
                        </button>
                        <span className="px-4 py-2">
                            Page {page} sur {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                        >
                            Suivant
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
