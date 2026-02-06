import { useState, useEffect } from 'react';
import api from '../lib/api';

export interface DeliveryPerson {
    id?: string;
    nom: string;
    telephone: string;
    ville_depart: string;
    ville_arrivee: string;
    prix: number;
}

export function useDeliveryPersons() {
    const [persons, setPersons] = useState<DeliveryPerson[]>([]);
    const [loading, setLoading] = useState(true);

    // Load from API on mount
    useEffect(() => {
        fetchPersons();
    }, []);

    // Fetch all delivery persons from API
    const fetchPersons = async () => {
        try {
            const res = await api.get('/delivery-persons');
            setPersons(res.data.data || []);
        } catch (error) {
            console.error('Error loading delivery persons:', error);
            setPersons([]);
        } finally {
            setLoading(false);
        }
    };

    // Add or update a delivery person via API
    const addPerson = async (person: DeliveryPerson) => {
        try {
            await api.post('/delivery-persons', person);
            // Refresh the list after adding
            await fetchPersons();
        } catch (error) {
            console.error('Error saving delivery person:', error);
            throw error;
        }
    };

    // Get suggestions based on input (client-side filtering)
    const getSuggestions = (input: string): DeliveryPerson[] => {
        if (!input.trim()) return [];

        const searchTerm = input.toLowerCase();
        return persons.filter(person =>
            person.nom.toLowerCase().includes(searchTerm)
        );
    };

    return {
        persons,
        loading,
        addPerson,
        getSuggestions,
        refreshPersons: fetchPersons
    };
}
