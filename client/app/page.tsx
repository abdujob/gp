'use client';

import SearchForm from '../components/SearchForm';
import AdCard from '../components/AdCard';
import { ShieldCheck, Truck, PiggyBank, Package, Users, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';


export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
    fetchAds(1);
  }, []);

  const fetchAds = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await api.get(`/ads?limit=12&page=${pageNum}`);
      const newAds = res.data.data || [];

      if (pageNum === 1) {
        setAds(newAds);
      } else {
        setAds(prev => [...prev, ...newAds]);
      }

      setHasMore(newAds.length === 12);
    } catch (err) {
      console.error('Erreur chargement annonces:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Infinite scroll avec Intersection Observer
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          console.log('Loading more ads, current page:', page);
          setPage(prevPage => {
            const nextPage = prevPage + 1;
            fetchAds(nextPage);
            return nextPage;
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // Start loading before reaching the sentinel
      }
    );

    // Observe the sentinel
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loading, page]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative py-16 px-4 overflow-hidden">
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
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Toutes les annonces</h2>

          {loading ? (
            <LoadingSpinner text="Chargement des annonces..." />
          ) : ads.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>

              {/* Sentinel pour infinite scroll */}
              <div
                ref={sentinelRef}
                className="h-20 flex items-center justify-center"
              >
                {loadingMore && (
                  <LoadingSpinner text="Chargement de plus d'annonces..." />
                )}
              </div>

              {/* Message quand il n'y a plus d'annonces */}
              {!hasMore && !loadingMore && (
                <div className="mt-4 text-center text-gray-500 text-sm">
                  Toutes les annonces ont été chargées
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
              Aucune annonce disponible pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
