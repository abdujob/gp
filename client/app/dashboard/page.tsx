'use client';

import Link from 'next/link';
import { Package, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardPage() {
    const { user, isLivreurGP } = useAuth();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Mon Tableau de bord</h1>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Cartes visibles uniquement pour LIVREUR_GP */}
                {isLivreurGP && (
                    <Link href="/dashboard/my-ads" className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center text-center gap-4 group">
                        <div className="bg-blue-100 p-4 rounded-full group-hover:bg-blue-200 transition-colors">
                            <Package className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Mes Annonces</h3>
                            <p className="text-gray-500 text-sm">Gérez vos trajets et colis</p>
                        </div>
                    </Link>
                )}

                {/* Carte Profil visible pour tous les utilisateurs connectés */}
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

            {/* Message de bienvenue selon le rôle */}
            <div className="mt-12">
                <h2 className="text-xl font-bold mb-4">
                    {isLivreurGP ? 'Bienvenue, Livreur GP !' : 'Bienvenue, Expéditeur !'}
                </h2>
                <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
                    {isLivreurGP ? (
                        <p>Vous pouvez créer des annonces pour proposer vos services de transport.</p>
                    ) : (
                        <p>Vous pouvez consulter les annonces et contacter les livreurs pour envoyer vos colis.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
