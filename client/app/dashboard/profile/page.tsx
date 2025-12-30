'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { User, Mail, Calendar, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) return <div className="p-8">Chargement...</div>;
    if (!user) return <div className="p-8 text-red-500">Erreur de chargement du profil</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl font-bold mb-8">Mon Profil</h1>

            <div className="bg-white p-8 rounded-xl shadow-lg border">
                <div className="flex flex-col items-center mb-8">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.full_name} className="w-32 h-32 rounded-full object-cover mb-4 shadow" />
                    ) : (
                        <div className="bg-gray-100 p-6 rounded-full mb-4">
                            <User className="w-16 h-16 text-gray-400" />
                        </div>
                    )}
                    <h2 className="text-2xl font-bold">{user.full_name}</h2>
                    <span className="text-gray-500 text-sm">Membre depuis {format(new Date(user.created_at), 'MMMM yyyy', { locale: fr })}</span>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-900">{user.email}</span>
                        </div>
                    </div>

                    {user.phone && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-900">{user.phone}</span>
                            </div>
                        </div>
                    )}

                    {user.address && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-900">{user.address}</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <button className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors opacity-50 cursor-not-allowed" disabled>
                            Modifier le profil (Bientôt disponible)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
