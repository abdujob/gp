'use client';

import SearchForm from '../components/SearchForm';
import AdCard from '../components/AdCard';
import { ShieldCheck, Truck, PiggyBank } from 'lucide-react';
import { useState, useEffect } from 'react';

// Mock Data for Demo (since DB might be empty/offline)
const MOCK_ADS = [
  {
    id: '1',
    title: 'Paris → New York',
    user_name: 'Julie',
    available_date: '2024-05-15',
    weight_capacity: '3 kg',
    transport_type: 'Petit colis',
    price: 25,
    avatar_url: '', // placeholder
  },
  {
    id: '2',
    title: 'Lyon → Marrakech',
    user_name: 'Sophie',
    available_date: '2024-04-20',
    weight_capacity: '5 kg',
    transport_type: 'Achats',
    price: 30,
    avatar_url: '',
  },
  {
    id: '3',
    title: 'Marseille → Bangkok',
    user_name: 'Alexandre',
    available_date: '2024-05-22',
    weight_capacity: '7 kg',
    transport_type: 'Documents',
    price: 40,
    avatar_url: '',
  }
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 py-20 px-4 relative overflow-hidden">
        {/* Background Decorative Elements can go here */}
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-900 mb-6 leading-tight">
            Envoyez un colis <span className="text-primary">grâce aux voyageurs</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-700 mb-12 max-w-2xl mx-auto">
            Trouvez un voyageur près de chez vous pour envoyer vos colis à moindre coût. Rapide, sécurisé et écologique.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <SearchForm />

        {/* Value Props */}
        {/* Value Props - Hide if user is logged in */}
        {!user && (
          <div className="grid md:grid-cols-3 gap-8 py-16">
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-100 p-3 rounded-full text-green-600">
                <PiggyBank className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">Envoyez moins cher</h3>
                <p className="text-gray-600 text-sm">Économisez jusqu'à 80% par rapport aux transporteurs traditionnels.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">Livraison sécurisée</h3>
                <p className="text-gray-600 text-sm">Profils vérifiés et assurance incluse pour tous vos envois.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">Flexible et pratique</h3>
                <p className="text-gray-600 text-sm">Des milliers de voyageurs disponibles partout dans le monde.</p>
              </div>
            </div>
          </div>
        )}

        {/* Listings Section */}
        <div className="py-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Annonces près de chez vous</h2>
              <p className="text-gray-500 mt-2">Découvrez les derniers trajets proposés par la communauté.</p>
            </div>
            <a href="/search" className="text-primary font-semibold hover:underline hidden md:block">
              Voir toutes les annonces →
            </a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Demo Map Placeholder - Left Column on Large screens? Or generic grid? prompt image shows map on left, cards on right. */}
            {/* For the Landing Page, standard Grid is better. The Search page will have the split view. */}

            {MOCK_ADS.map(ad => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
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
