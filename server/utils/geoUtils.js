/**
 * Utilitaires de géolocalisation et calcul de distances
 */

/**
 * Convertit des degrés en radians
 */
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calcule la distance entre deux points GPS en utilisant la formule de Haversine
 * @param {number} lat1 - Latitude du point 1
 * @param {number} lon1 - Longitude du point 1
 * @param {number} lat2 - Latitude du point 2
 * @param {number} lon2 - Longitude du point 2
 * @returns {number} Distance en kilomètres
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

/**
 * Geocode une ville en utilisant Nominatim (OpenStreetMap)
 * @param {string} cityName - Nom de la ville
 * @returns {Promise<{lat: number, lng: number, display_name: string} | null>}
 */
async function geocodeCity(cityName) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'GP-Platform/1.0'
            }
        });

        const data = await response.json();

        if (data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                display_name: data[0].display_name
            };
        }

        return null;
    } catch (error) {
        console.error(`Erreur geocoding pour ${cityName}:`, error.message);
        return null;
    }
}

/**
 * Calcule la différence en jours entre deux dates
 * @param {string|Date} date1 
 * @param {string|Date} date2 
 * @returns {number} Différence en jours (peut être négatif)
 */
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Calcule un score de pertinence pour une annonce
 * @param {object} ad - L'annonce
 * @param {object} searchParams - Paramètres de recherche
 * @param {object} distances - Distances calculées {depart: number, arrivee: number}
 * @returns {number} Score de pertinence (0-100)
 */
function calculateRelevanceScore(ad, searchParams, distances) {
    let score = 0;

    // Correspondance exacte ville de départ (40 points)
    if (searchParams.departCity && ad.city) {
        if (ad.city.toLowerCase() === searchParams.departCity.toLowerCase()) {
            score += 40;
        } else if (distances.depart !== null) {
            // Proximité géographique départ (0-30 points)
            // Plus c'est proche, plus le score est élevé
            const maxDistance = 100; // km
            const distScore = Math.max(0, 30 * (1 - distances.depart / maxDistance));
            score += distScore;
        }
    }

    // Correspondance exacte ville d'arrivée (40 points)
    if (searchParams.arriveeCity && ad.destination_city) {
        if (ad.destination_city.toLowerCase() === searchParams.arriveeCity.toLowerCase()) {
            score += 40;
        } else if (distances.arrivee !== null) {
            // Proximité géographique arrivée (0-30 points)
            const maxDistance = 100; // km
            const distScore = Math.max(0, 30 * (1 - distances.arrivee / maxDistance));
            score += distScore;
        }
    }

    // Correspondance date (0-20 points)
    if (searchParams.date && ad.available_date) {
        const dateDiff = Math.abs(daysBetween(ad.available_date, searchParams.date));
        if (dateDiff === 0) {
            score += 20;
        } else {
            // Moins de points si la date est éloignée
            const dateScore = Math.max(0, 20 - (dateDiff * 2));
            score += dateScore;
        }
    }

    return Math.round(score);
}

module.exports = {
    calculateDistance,
    geocodeCity,
    daysBetween,
    calculateRelevanceScore,
    toRad
};
