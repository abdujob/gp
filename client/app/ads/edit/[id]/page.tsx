'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../lib/api';

export default function EditAdPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [availableDate, setAvailableDate] = useState('');
    const [transportType, setTransportType] = useState('colis');
    const [weightCapacity, setWeightCapacity] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState<File | null>(null);

    // Mock Coords (Real app would geocode address)
    const latitude = 48.8566;
    const longitude = 2.3522;

    useEffect(() => {
        const fetchAd = async () => {
            if (!params.id) return;
            try {
                const res = await api.get(`/ads/${params.id}`);
                const ad = res.data;
                setTitle(ad.title);
                setDescription(ad.description);
                setAddress(ad.address);
                setCity(ad.city);
                // Date needs to be formatted for input type="date" (YYYY-MM-DD)
                if (ad.available_date) {
                    setAvailableDate(new Date(ad.available_date).toISOString().split('T')[0]);
                }
                setTransportType(ad.transport_type);
                setWeightCapacity(ad.weight_capacity);
                setPrice(ad.price);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch ad", err);
                alert("Impossible de charger l'annonce");
                router.push('/dashboard/my-ads');
            }
        };
        fetchAd();
    }, [params.id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('address', address);
        formData.append('city', city);
        formData.append('latitude', latitude.toString());
        formData.append('longitude', longitude.toString());
        formData.append('available_date', availableDate);
        formData.append('transport_type', transportType);
        formData.append('weight_capacity', weightCapacity);
        formData.append('price', price.toString());
        if (image) {
            formData.append('image', image);
        }

        try {
            await api.put(`/ads/${params.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            router.push('/dashboard/my-ads');
        } catch (err) {
            console.error("Failed to update ad", err);
            alert("Erreur lors de la mise à jour");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8">Chargement...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Modifier mon annonce</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Titre de l'annonce</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                        placeholder="Ex: Paris -> New York, 3kg dispo"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ville de départ</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Adresse précise (Gare, Aéroport...)</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date de départ</label>
                        <input
                            type="date"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                            value={availableDate}
                            onChange={e => setAvailableDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
                        <input
                            type="number"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type de transport</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                            value={transportType}
                            onChange={e => setTransportType(e.target.value)}
                        >
                            <option value="colis">Petit Colis</option>
                            <option value="document">Documents</option>
                            <option value="autre">Autre / Gros Volume</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Capacité (ex: 5kg)</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                            value={weightCapacity}
                            onChange={e => setWeightCapacity(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        required
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-3"
                        placeholder="Détails du voyage, restrictions..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Nouvelle Photo (optionnel)</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                        onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-1/3 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-2/3 bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Mise à jour...' : 'Mettre à jour'}
                    </button>
                </div>

            </form>
        </div>
    );
}
