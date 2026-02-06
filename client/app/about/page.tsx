'use client';

import { ShieldCheck, Truck, PiggyBank, Package, Users, MapPin } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        À propos de GP Senegal
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto">
                        La plateforme qui révolutionne l'envoi de colis entre la France et le Sénégal
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {/* Value Propositions */}
                <div className="mb-20">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Pourquoi choisir GP Senegal ?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-green-100 p-3 rounded-full text-green-600 flex-shrink-0">
                                <PiggyBank className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Envoyez moins cher</h3>
                                <p className="text-gray-600 text-sm">
                                    Économisez jusqu'à 80% par rapport aux transporteurs traditionnels pour vos colis France Sénégal.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600 flex-shrink-0">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Transport sécurisé GP</h3>
                                <p className="text-gray-600 text-sm">
                                    Profils vérifiés et assurance incluse pour tous vos envois GP Dakar.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-orange-100 p-3 rounded-full text-orange-600 flex-shrink-0">
                                <Truck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 mb-2">Réseau GP France Senegal</h3>
                                <p className="text-gray-600 text-sm">
                                    Des milliers de voyageurs GP disponibles entre la France et le Sénégal.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comment ça marche */}
                <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Comment fonctionne GP Senegal ?
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Envoyez vos colis entre la France et le Sénégal en 3 étapes simples
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Package className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2">1. Publiez votre annonce</h3>
                            <p className="text-gray-600">
                                Créez une annonce GP pour votre colis à envoyer de France vers Dakar ou inversement
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Users className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2">2. Trouvez un voyageur GP</h3>
                            <p className="text-gray-600">
                                Parcourez les annonces de voyageurs GP France Senegal et contactez celui qui vous convient
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <MapPin className="w-10 h-10 text-orange-600" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2">3. Recevez votre colis</h3>
                            <p className="text-gray-600">
                                Le voyageur transporte votre colis en toute sécurité jusqu'à destination au Sénégal ou en France
                            </p>
                        </div>
                    </div>
                </div>

                {/* Notre Mission */}
                <div className="mt-20 bg-white rounded-2xl p-8 md:p-12 shadow-sm">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Notre Mission</h2>
                    <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto text-center">
                        GP Senegal connecte les personnes qui souhaitent envoyer des colis entre la France et le Sénégal
                        avec des voyageurs de confiance. Notre plateforme permet des envois économiques, rapides et sécurisés,
                        tout en créant une communauté solidaire entre la France et le Sénégal.
                    </p>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        Prêt à envoyer votre colis ?
                    </h3>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <a
                            href="/post-ad"
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Publier une annonce
                        </a>
                        <a
                            href="/search"
                            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Trouver un voyageur
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
