'use client';

import Link from 'next/link';
import { Package, User, PlusCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { user, logout, isLivreurGP, isAdmin } = useAuth();

    return (
        <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Package className="w-8 h-8 text-accent" />
                    <span>GP</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    {/* Liens visibles uniquement pour LIVREUR_GP et ADMIN */}
                    {(isLivreurGP || isAdmin) && (
                        <Link href="/dashboard/my-ads" className="text-gray-600 hover:text-primary transition-colors">
                            Mes Annonces
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Bouton "Poster une annonce" visible pour LIVREUR_GP et ADMIN */}
                    {(isLivreurGP || isAdmin) && (
                        <Link
                            href="/post-ad"
                            className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-full font-medium hover:bg-green-600 transition-all shadow-md"
                        >
                            <PlusCircle className="w-5 h-5" />
                            <span>Poster une annonce</span>
                        </Link>
                    )}

                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profile" className="w-8 h-8 rounded-full border" />
                                ) : (
                                    <User className="w-6 h-6 text-gray-700" />
                                )}
                            </Link>
                            <button onClick={logout} className="text-sm text-red-500 hover:underline">
                                Déconnexion
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-5 py-2 bg-primary text-white rounded-full font-medium hover:bg-blue-700 transition-all shadow-md"
                        >
                            Se connecter
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
