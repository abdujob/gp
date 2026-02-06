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
