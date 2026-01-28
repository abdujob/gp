'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';

interface Stats {
    users: {
        total: number;
        byRole: Array<{ role: string; count: string }>;
        recent: number;
    };
    ads: {
        total: number;
        active: number;
        recent: number;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        if (isAdmin) {
            loadStats();
        }
    }, [isAdmin]);

    const loadStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Error loading stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Bienvenue, {user?.full_name}
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                            Retour au site
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatsCard
                                title="Total Utilisateurs"
                                value={stats?.users.total || 0}
                                icon="👥"
                                color="blue"
                            />
                            <StatsCard
                                title="Nouveaux (7j)"
                                value={stats?.users.recent || 0}
                                icon="🆕"
                                color="green"
                            />
                            <StatsCard
                                title="Total Annonces"
                                value={stats?.ads.total || 0}
                                icon="📢"
                                color="purple"
                            />
                            <StatsCard
                                title="Annonces Actives"
                                value={stats?.ads.active || 0}
                                icon="✅"
                                color="orange"
                            />
                        </div>

                        {/* Users by Role */}
                        <div className="bg-white rounded-lg shadow p-6 mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Utilisateurs par rôle
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {stats?.users.byRole.map((role) => (
                                    <div
                                        key={role.role}
                                        className="bg-gray-50 rounded-lg p-4 text-center"
                                    >
                                        <p className="text-sm text-gray-600 uppercase">{role.role}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">
                                            {role.count}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link
                                href="/admin/users"
                                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                            >
                                <div className="flex items-center">
                                    <div className="text-4xl mr-4">👥</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Gérer les utilisateurs
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Voir, rechercher et supprimer des utilisateurs
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            <Link
                                href="/admin/ads"
                                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                            >
                                <div className="flex items-center">
                                    <div className="text-4xl mr-4">📢</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Gérer les annonces
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Voir, rechercher et supprimer des annonces
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

interface StatsCardProps {
    title: string;
    value: number;
    icon: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`text-4xl ${colorClasses[color]} p-3 rounded-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
