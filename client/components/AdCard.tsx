import Link from 'next/link';
import { Calendar, MapPin, Package, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdProps {
    id: string;
    title: string; // e.g. Paris -> New York
    user_name: string;
    description?: string;
    available_date: string;
    weight_capacity: string;
    price: number;
    avatar_url?: string;
    transport_type: string;
}

const AdCard = ({ ad }: { ad: AdProps }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {ad.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        {ad.avatar_url ? (
                            <img src={ad.avatar_url} alt={ad.user_name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                            <User className="w-5 h-5 bg-gray-100 rounded-full p-1" />
                        )}
                        <span>{ad.user_name}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                        {format(new Date(ad.available_date), 'd MMMM yyyy', { locale: fr })}
                    </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="font-medium">Espace: {ad.weight_capacity || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-orange-500" />
                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs px-2 py-1">
                            {ad.transport_type}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t flex justify-between items-center">
                <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-500">À partir de</span>
                    <span className="text-xl font-bold text-gray-900">{ad.price}€</span>
                </div>
                <Link
                    href={`/ads/${ad.id}`}
                    className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
                >
                    Voir l'annonce
                </Link>
            </div>
        </div>
    );
};

export default AdCard;
