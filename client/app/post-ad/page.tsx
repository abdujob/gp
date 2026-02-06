'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useDeliveryPersons, DeliveryPerson } from '../../hooks/useDeliveryPersons';
import DeliveryPersonAutocomplete from '../../components/DeliveryPersonAutocomplete';
import MonthDayPicker from '../../components/MonthDayPicker';

function PostAdPageContent() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [departureCity, setDepartureCity] = useState('');
    const [arrivalCity, setArrivalCity] = useState('');
    const [description, setDescription] = useState('');
    const [availableDate, setAvailableDate] = useState('');
    const [transportTypes, setTransportTypes] = useState<string[]>([]);
    const [price, setPrice] = useState('');
    const [phone, setPhone] = useState('');
    const [advertiserName, setAdvertiserName] = useState('');

    // Admin-specific fields
    const [deliveryPersonName, setDeliveryPersonName] = useState('');
    const [deliveryPersonPhone, setDeliveryPersonPhone] = useState('');

    // Check if user is admin
    const isAdmin = user?.email === 'gp.notifs@gmail.com';

    // Delivery persons hook (admin only)
    const { getSuggestions, addPerson } = useDeliveryPersons();

    // Mock Coords (Real app would geocode address)
    const latitude = 48.8566;
    const longitude = 2.3522;

    // Handle delivery person selection from autocomplete
    const handlePersonSelect = (person: DeliveryPerson) => {
        setDeliveryPersonName(person.nom);
        setDeliveryPersonPhone(person.telephone);
        setDepartureCity(person.ville_depart);
        setArrivalCity(person.ville_arrivee);
        setPrice(person.prix.toString());
    };

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
        // Use departure city as both address and city for now
        formData.append('address', departureCity);
        formData.append('city', departureCity);
        formData.append('latitude', latitude.toString());
        formData.append('longitude', longitude.toString());
        formData.append('available_date', availableDate);
        formData.append('transport_types', JSON.stringify(transportTypes));
        formData.append('price', price);
        formData.append('phone', isAdmin ? deliveryPersonPhone : phone);
        // Admin must specify advertiser name
        if (isAdmin) {
            formData.append('advertiser_name', deliveryPersonName);
        }

        try {
            await api.post('/ads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Save delivery person for future use (admin only)
            if (isAdmin && deliveryPersonName) {
                addPerson({
                    nom: deliveryPersonName,
                    telephone: deliveryPersonPhone,
                    ville_depart: departureCity,
                    ville_arrivee: arrivalCity,
                    prix: parseFloat(price)
                });
            }

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

                {/* Admin-only fields */}
                {isAdmin && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations du livreur</h3>

                        <DeliveryPersonAutocomplete
                            value={deliveryPersonName}
                            onChange={setDeliveryPersonName}
                            onSelect={handlePersonSelect}
                            suggestions={getSuggestions(deliveryPersonName)}
                            label="Nom du livreur"
                            placeholder="Commencez à taper pour voir les suggestions..."
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Numéro de téléphone (WhatsApp) *
                            </label>
                            <input
                                type="tel"
                                value={deliveryPersonPhone}
                                onChange={e => setDeliveryPersonPhone(e.target.value)}
                                placeholder="+221 77 123 45 67"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Ce numéro sera utilisé pour le contact WhatsApp</p>
                        </div>
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
                        {isAdmin ? (
                            <MonthDayPicker
                                value={availableDate}
                                onChange={setAvailableDate}
                                label="Date de départ"
                                required
                            />
                        ) : (
                            <>
                                <label className="block text-sm font-medium text-gray-700">Date de départ</label>
                                <input
                                    type="date"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                                    value={availableDate}
                                    onChange={e => setAvailableDate(e.target.value)}
                                    disabled={loading}
                                />
                            </>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
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

                {/* Nom du livreur (obligatoire pour admin uniquement) */}
                {isAdmin && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom du livreur *</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 border px-3"
                            placeholder="Nom du livreur pour cette annonce"
                            value={advertiserName}
                            onChange={e => setAdvertiserName(e.target.value)}
                            disabled={loading}
                        />
                        <p className="mt-1 text-sm text-gray-500">Spécifiez le nom du livreur pour cette annonce</p>
                    </div>
                )}



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
 * Page protégée - Accessible aux LIVREUR_GP et ADMIN
 */
export default function PostAdPage() {
    return (
        <ProtectedRoute allowedRoles={['LIVREUR_GP', 'ADMIN']}>
            <PostAdPageContent />
        </ProtectedRoute>
    );
}
