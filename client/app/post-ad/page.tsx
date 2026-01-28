'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import ProtectedRoute from '../../components/ProtectedRoute';

function PostAdPageContent() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [departureCity, setDepartureCity] = useState('');
    const [arrivalCity, setArrivalCity] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [availableDate, setAvailableDate] = useState('');
    const [transportTypes, setTransportTypes] = useState<string[]>([]);
    const [price, setPrice] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [phone, setPhone] = useState('');
    const [advertiserName, setAdvertiserName] = useState('');

    // Mock Coords (Real app would geocode address)
    const latitude = 48.8566;
    const longitude = 2.3522;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('departure_city', departureCity);
        formData.append('arrival_city', arrivalCity);
        if (description) {
            formData.append('description', description);
        }
        formData.append('address', address);
        formData.append('city', city);
        formData.append('latitude', latitude.toString());
        formData.append('longitude', longitude.toString());
        formData.append('available_date', availableDate);
        formData.append('transport_types', JSON.stringify(transportTypes));
        formData.append('price', price);
        if (image) {
            formData.append('image', image);
        }
        formData.append('phone', phone);
        if (advertiserName) {
            formData.append('advertiser_name', advertiserName);
        }

        try {
            await api.post('/ads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            router.push('/dashboard/my-ads');
        } catch (err: any) {
            console.error("Failed to post ad", err);
            setError(err.response?.data?.msg || "Erreur lors de la publication de l'annonce");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Poster une annonce</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                {/* Villes de départ et d'arrivée */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ville de départ *</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                            placeholder="Ex: Dakar"
                            value={departureCity}
                            onChange={e => setDepartureCity(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ville d'arrivée *</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                            placeholder="Ex: Paris"
                            value={arrivalCity}
                            onChange={e => setArrivalCity(e.target.value)}
                            disabled={loading}
                        />
                    </div>
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
                            disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prix (FCFA)</label>
                        <input
                            type="number"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Types de colis (sélection multiple) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de colis * (sélection multiple)</label>
                    <div className="space-y-2">
                        {['Petit Colis', 'Documents', 'Gros Volume'].map(type => (
                            <label key={type} className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={transportTypes.includes(type)}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            setTransportTypes([...transportTypes, type]);
                                        } else {
                                            setTransportTypes(transportTypes.filter(t => t !== type));
                                        }
                                    }}
                                    disabled={loading}
                                />
                                <span className="ml-2 text-sm text-gray-700">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Description optionnelle */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description (optionnel)</label>
                    <textarea
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary border p-3"
                        placeholder="Détails du voyage, restrictions..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        disabled={loading}
                    />
                    <p className="mt-1 text-sm text-gray-500">Minimum 10 caractères si rempli</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Numéro de téléphone (WhatsApp)</label>
                    <input
                        type="tel"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                        placeholder="+221 77 123 45 67"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        disabled={loading}
                    />
                    <p className="mt-1 text-sm text-gray-500">Ce numéro sera utilisé pour le contact WhatsApp</p>
                </div>

                {/* Nom de l'annonceur (admin uniquement) */}
                {/* Note: Pour l'instant visible pour tous LIVREUR_GP, sera restreint aux ADMIN après redéploiement frontend */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nom de l'annonceur (optionnel - admin uniquement)</label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                        placeholder="Laissez vide pour utiliser votre nom"
                        value={advertiserName}
                        onChange={e => setAdvertiserName(e.target.value)}
                        disabled={loading}
                    />
                    <p className="mt-1 text-sm text-gray-500">Remplissez uniquement si vous créez une annonce pour quelqu'un d'autre</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Photo (optionnel)</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                        onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || transportTypes.length === 0}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Publication...' : 'Publier l\'annonce'}
                </button>
            </form>
        </div>
    );
}

/**
 * Page protégée - Accessible uniquement aux LIVREUR_GP
 */
export default function PostAdPage() {
    return (
        <ProtectedRoute requiredRole="LIVREUR_GP">
            <PostAdPageContent />
        </ProtectedRoute>
    );
}
