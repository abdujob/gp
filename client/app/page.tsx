'use client';

import SearchForm from '../components/SearchForm';
import AdCard from '../components/AdCard';
import { ShieldCheck, Truck, PiggyBank, Package, Users, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';


export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));

    // Charger les annonces récentes depuis la DB
    const fetchAds = async () => {
      try {
        const res = await api.get('/ads?limit=6&page=1');
        setAds(res.data.data || []);
      } catch (err) {
        console.error('Erreur chargement annonces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative py-16 px-4 overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-image.png"
            alt="GP Senegal - Envoi de colis France Senegal Dakar via voyageurs - Transport GP"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/50"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
            GP Senegal - Envoyez vos colis <span className="text-yellow-300">France Sénégal</span>
          </h1>
          <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto drop-shadow-md">
            GP Dakar : Trouvez un voyageur pour envoyer vos colis entre la France et le Sénégal. Transport économique et sécurisé.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <SearchForm />

        {/* Value Props - Hide if user is logged in */}
        {!user && (
          <>
            <div className="grid md:grid-cols-3 gap-8 py-16">
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <PiggyBank className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Envoyez moins cher</h3>
                  <p className="text-gray-600 text-sm">Économisez jusqu'à 80% par rapport aux transporteurs traditionnels pour vos colis France Sénégal.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Transport sécurisé GP</h3>
                  <p className="text-gray-600 text-sm">Profils vérifiés et assurance incluse pour tous vos envois GP Dakar.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Réseau GP France Senegal</h3>
                  <p className="text-gray-600 text-sm">Des milliers de voyageurs GP disponibles entre la France et le Sénégal.</p>
                </div>
              </div>
            </div>

            {/* Comment ça marche Section */}
            <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Comment fonctionne GP Senegal ?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Envoyez vos colis entre la France et le Sénégal en 3 étapes simples
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 px-4">
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
          </>
        )}

        {/* Listings Section */}
        <div className="py-6">

          {loading ? (
            <LoadingSpinner text="Chargement des annonces..." />
          ) : ads.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map(ad => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
              Aucune annonce disponible pour le moment.
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <a href="/search" className="text-primary font-semibold hover:underline">
              Voir toutes les annonces →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
