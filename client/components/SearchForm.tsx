'use client';

import { Search, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SearchForm = () => {
    const router = useRouter();
    const [villeDepart, setVilleDepart] = useState('');
    const [villeArrivee, setVilleArrivee] = useState('');
    const [date, setDate] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();

        if (villeDepart) params.append('depart', villeDepart);
        if (villeArrivee) params.append('arrivee', villeArrivee);
        if (date && date !== 'custom') params.append('date', date);

        router.push(`/search?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 items-center max-w-5xl mx-auto -mt-10 relative z-20">
            <div className="flex-1 w-full bg-gray-50 rounded-lg flex items-center px-4 py-3 border focus-within:border-primary transition-colors">
                <MapPin className="text-gray-400 w-5 h-5 mr-3" />
                <input
                    type="text"
                    placeholder="Ville de départ (ex: Paris, Dakar)"
                    className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-400"
                    value={villeDepart}
                    onChange={(e) => setVilleDepart(e.target.value)}
                />
            </div>

            <div className="flex-1 w-full bg-gray-50 rounded-lg flex items-center px-4 py-3 border focus-within:border-primary transition-colors">
                <MapPin className="text-gray-400 w-5 h-5 mr-3" />
                <input
                    type="text"
                    placeholder="Ville d'arrivée (ex: Lyon, Thiès)"
                    className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-400"
                    value={villeArrivee}
                    onChange={(e) => setVilleArrivee(e.target.value)}
                />
            </div>

            <div className="w-full md:w-48 bg-gray-50 rounded-lg flex items-center px-4 py-3 border focus-within:border-primary transition-colors">
                <CalendarIcon className="text-gray-400 w-5 h-5 mr-3" />
                <select
                    className="bg-transparent w-full outline-none text-gray-700 cursor-pointer"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                >
                    <option value="">Quand ?</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois-ci</option>
                    <option value="custom">Date précise...</option>
                </select>
            </div>

            {date === 'custom' && (
                <div className="w-full md:w-48 bg-gray-50 rounded-lg flex items-center px-4 py-3 border focus-within:border-primary transition-colors">
                    <input
                        type="date"
                        className="bg-transparent w-full outline-none text-gray-700"
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            )}

            <button type="submit" className="w-full md:w-auto bg-accent hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg">
                <Search className="w-5 h-5" />
                Rechercher
            </button>
        </form>
    );
};

export default SearchForm;
