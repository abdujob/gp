import { useState, useEffect } from 'react';

export interface DeliveryPerson {
    nom: string;
    telephone: string;
    ville_depart: string;
    ville_arrivee: string;
    prix: number;
}

const STORAGE_KEY = 'admin_delivery_persons';

export function useDeliveryPersons() {
    const [persons, setPersons] = useState<DeliveryPerson[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setPersons(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading delivery persons:', error);
        }
    }, []);

    // Save to localStorage whenever persons change
    const saveToStorage = (updatedPersons: DeliveryPerson[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPersons));
            setPersons(updatedPersons);
        } catch (error) {
            console.error('Error saving delivery persons:', error);
        }
    };

    // Add or update a delivery person
    const addPerson = (person: DeliveryPerson) => {
        const existingIndex = persons.findIndex(
            p => p.nom.toLowerCase() === person.nom.toLowerCase()
        );

        let updatedPersons: DeliveryPerson[];
        if (existingIndex >= 0) {
            // Update existing person
            updatedPersons = [...persons];
            updatedPersons[existingIndex] = person;
        } else {
            // Add new person
            updatedPersons = [...persons, person];
        }

        saveToStorage(updatedPersons);
    };

    // Get suggestions based on input
    const getSuggestions = (input: string): DeliveryPerson[] => {
        if (!input.trim()) return [];

        const searchTerm = input.toLowerCase();
        return persons.filter(person =>
            person.nom.toLowerCase().includes(searchTerm)
        );
    };

    // Remove a delivery person
    const removePerson = (nom: string) => {
        const updatedPersons = persons.filter(
            p => p.nom.toLowerCase() !== nom.toLowerCase()
        );
        saveToStorage(updatedPersons);
    };

    return {
        persons,
        addPerson,
        getSuggestions,
        removePerson
    };
}
