'use client';

import Link from 'next/link';
import { Package, MessageSquare, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Mon Tableau de bord</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {user && user.role === 'LIVREUR_GP' && (
                    <>
                        <Link href="/dashboard/my-ads" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center text-center gap-4 group">
                            <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-200 transition-colors">
                                <Package className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Mes Annonces</h3>
                                <p className="text-gray-500 text-sm">Gérez vos trajets et colis</p>
                            </div>
                        </Link>

                        <Link href="/dashboard/messages" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center text-center gap-4 group">
                            <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-200 transition-colors">
                                <MessageSquare className="w-8 h-8 text-secondary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Messagerie</h3>
                                <p className="text-gray-500 text-sm">Discutez avec les utilisateurs</p>
                            </div>
                        </Link>
                    </>
                )}

                <Link href="/dashboard/profile" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center text-center gap-4 group">
                    <div className="bg-gray-100 p-4 rounded-full group-hover:bg-gray-200 transition-colors">
                        <Settings className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Mon Profil</h3>
                        <p className="text-gray-500 text-sm">Modifiez vos informations</p>
                    </div>
                </Link>
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold mb-4">Activité Récente</h2>
                <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
                    Aucune activité récente.
                </div>
            </div>
        </div>
    );
}
