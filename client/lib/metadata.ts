import { Metadata } from 'next';

export const baseUrl = 'https://gp.senecoins.com';

export const defaultMetadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: 'GP Senegal - Envoi de Colis France Senegal via Voyageurs',
        template: '%s | GP Senegal'
    },
    description: 'GP Senegal : plateforme d\'envoi de colis entre la France et le Sénégal (Dakar) via des voyageurs. Transport de colis économique, sécurisé et rapide. Annonces GP France Senegal.',
    keywords: [
        'gp senegal',
        'gp dakar',
        'gp france',
        'gp france senegal',
        'annonces gp senegal france',
        'gp colis france senegal',
        'gp transport france senegal',
        'envoi colis senegal',
        'colis dakar',
        'transport colis france senegal',
        'voyageur colis',
        'livraison senegal',
        'expédition senegal',
        'gp annonces',
        'petites annonces senegal'
    ],
    authors: [{ name: 'GP Senegal' }],
    creator: 'GP Senegal',
    publisher: 'GP Senegal',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'fr_SN',
        alternateLocale: ['fr_FR'],
        url: baseUrl,
        siteName: 'GP Senegal',
        title: 'GP Senegal - Envoi de Colis France Senegal via Voyageurs',
        description: 'Plateforme d\'envoi de colis entre la France et le Sénégal via des voyageurs. Transport économique et sécurisé.',
        images: [
            {
                url: `${baseUrl}/hero-image.png`,
                width: 1200,
                height: 630,
                alt: 'GP Senegal - Envoi de colis France Senegal',
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'GP Senegal - Envoi de Colis France Senegal',
        description: 'Envoyez vos colis entre la France et le Sénégal via des voyageurs. Économique et sécurisé.',
        images: [`${baseUrl}/hero-image.png`],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: baseUrl,
    },
};

export const structuredData = {
    organization: {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'GP Senegal',
        url: baseUrl,
        logo: `${baseUrl}/hero-image.png`,
        description: 'Plateforme de mise en relation entre expéditeurs et voyageurs pour l\'envoi de colis entre la France et le Sénégal',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'SN',
            addressLocality: 'Dakar',
        },
        sameAs: [
            // Ajoutez vos réseaux sociaux ici si vous en avez
        ],
    },
    website: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'GP Senegal',
        url: baseUrl,
        description: 'Envoi de colis France Senegal via voyageurs - GP Dakar',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    },
    service: {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Service de Transport de Colis GP',
        provider: {
            '@type': 'Organization',
            name: 'GP Senegal',
        },
        areaServed: [
            {
                '@type': 'Country',
                name: 'Senegal',
            },
            {
                '@type': 'Country',
                name: 'France',
            },
        ],
        description: 'Service de transport de colis entre la France et le Sénégal via des voyageurs vérifiés',
    },
};
