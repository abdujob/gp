'use client';
import Link from 'next/link';
import { Package, User, PlusCircle, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    return (
        <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Package className="w-8 h-8 text-accent" />
                    <span>SendVoyage</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/how-it-works" className="text-gray-600 hover:text-primary transition-colors">
                        Comment ça marche ?
                    </Link>
                    <Link href="/search" className="text-gray-600 hover:text-primary transition-colors">
                        Rechercher
                    </Link>
                    {user && user.role === 'LIVREUR_GP' && (
                        <>
                            <Link href="/dashboard/my-ads" className="text-gray-600 hover:text-primary transition-colors">
                                Mes annonces
                            </Link>
                            <Link href="/dashboard/messages" className="text-gray-600 hover:text-primary transition-colors">
                                Messages
                            </Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {user && user.role === 'LIVREUR_GP' && (
                        <Link
                            href="/post-ad"
                            className="hidden md:flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-full font-medium hover:bg-green-600 transition-all shadow-md"
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
                            <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
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
