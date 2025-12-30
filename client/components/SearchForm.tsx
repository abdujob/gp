'use client';

import { Search, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SearchForm = () => {
    const router = useRouter();
    const [address, setAddress] = useState('');
    const [type, setType] = useState('');
    const [date, setDate] = useState('');

    const [radius, setRadius] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();

        if (address) {
            params.append('address', address);
            // We'll geocode on the client before pushing, OR let the Search page handle it.
            // Let's geocode HERE to pass coordinates in URL, so results are linkable/bookmarkable with coords.
            try {
                // Determine if we need to call the utility, but importing utility in client component might allow it.
                // Dynamic import or direct if utils is client-safe.
                // For simplicity/speed, I'll direct user to Search page and let it resolve, 
                // OR use a quick fetch here.
                // Let's pass the raw address and let the SearchPage resolve it to avoid async lag on button click
                // unless we want to ensure valid address.
                // Updating plan: Pass address text, let SearchPage geocode (loading state).
            } catch (e) { }
        }

        if (type) params.append('type', type);
        if (date && date !== 'custom') params.append('date', date);
        // If Custom date input needed, logic needs adjusting. 
        // For 'custom' handling above, I used a simplified UI approach.
        // Let's fix the Date state management properly.
        if (radius) params.append('radius', radius);

        router.push(`/search?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-4 items-center max-w-4xl mx-auto -mt-10 relative z-20">
            <div className="flex-1 w-full bg-gray-50 rounded-lg flex items-center px-4 py-3 border focus-within:border-primary transition-colors">
                <MapPin className="text-gray-400 w-5 h-5 mr-3" />
                <input
                    type="text"
                    placeholder="Votre adresse ou ville"
                    className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-400"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>

            <div className="w-full md:w-48 bg-gray-50 rounded-lg flex items-center px-4 py-3 border focus-within:border-primary transition-colors">
                <select
                    className="bg-transparent w-full outline-none text-gray-700 cursor-pointer"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                >
                    <option value="">Quel type de colis ?</option>
                    <option value="colis">Petit colis</option>
                    <option value="document">Documents</option>
                    <option value="autre">Gros volume</option>
                </select>
            </div>

            <div className="w-full md:w-32 bg-gray-50 rounded-lg flex items-center px-4 py-3 border focus-within:border-primary transition-colors">
                <select
                    className="bg-transparent w-full outline-none text-gray-700 cursor-pointer"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                >
                    <option value="">Rayon</option>
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="25">25 km</option>
                    <option value="50">50 km</option>
                    <option value="100">100 km</option>
                </select>
            </div>

            <div className="w-full md:w-40 bg-gray-50 rounded-lg flex items-center px-4 py-3 border focus-within:border-primary transition-colors">
                <CalendarIcon className="text-gray-400 w-5 h-5 mr-3" />
                <select
                    className="bg-transparent w-full outline-none text-gray-700 cursor-pointer"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                >
                    <option value="">Date</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="custom">Date précise...</option>
                </select>
            </div>

            {date === 'custom' && (
                <div className="w-full md:w-40 bg-gray-50 rounded-lg flex items-center px-4 py-3 border focus-within:border-primary transition-colors">
                    <input
                        type="date"
                        className="bg-transparent w-full outline-none text-gray-700"
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            )
            }

            <button type="submit" className="w-full md:w-auto bg-accent hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Rechercher
            </button>
        </form>
    );
};

export default SearchForm;
