import { Calendar, MapPin, Package, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdProps {
    id: string;
    title: string;
    user_name: string;
    user_phone?: string;
    description?: string;
    available_date: string;
    weight_capacity: string;
    price: number;
    avatar_url?: string;
    transport_type: string;
    relevance?: {
        score: number;
        distance_depart_km?: number;
        distance_arrivee_km?: number;
        date_diff_days?: number;
        exact_match?: boolean;
    };
}

interface AdCardProps {
    ad: AdProps;
    showRelevance?: boolean;
}

const AdCard = ({ ad, showRelevance = false }: AdCardProps) => {
    // Formater le message WhatsApp
    const whatsappMessage = encodeURIComponent(
        `Bonjour, j'ai vu votre annonce sur gp.senecoins.com et je souhaite expédier un colis. Est-ce toujours d'actualité ?`
    );

    const whatsappLink = ad.user_phone
        ? `https://wa.me/${ad.user_phone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`
        : null;

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

            {/* Badges de pertinence */}
            {showRelevance && ad.relevance && (
                <div className="flex flex-wrap gap-2">
                    {ad.relevance.distance_depart_km !== null && ad.relevance.distance_depart_km !== undefined && ad.relevance.distance_depart_km > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                            📍 ~{ad.relevance.distance_depart_km} km
                        </span>
                    )}
                    {ad.relevance.date_diff_days !== null && ad.relevance.date_diff_days !== undefined && ad.relevance.date_diff_days !== 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                            📅 {ad.relevance.date_diff_days > 0 ? '+' : ''}{ad.relevance.date_diff_days}j
                        </span>
                    )}
                    {ad.relevance.score !== undefined && ad.relevance.score < 100 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                            ⭐ Score: {ad.relevance.score}
                        </span>
                    )}
                </div>
            )}

            <div className="mt-auto pt-4 border-t flex justify-between items-center">
                <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-500">À partir de</span>
                    <span className="text-xl font-bold text-gray-900">{ad.price}€</span>
                </div>
                {whatsappLink ? (
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                        WhatsApp
                    </a>
                ) : (
                    <span className="text-sm text-gray-400">Numéro non disponible</span>
                )}
            </div>
        </div>
    );
};

export default AdCard;
