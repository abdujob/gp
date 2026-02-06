'use client';

import { useState, useRef, useEffect } from 'react';
import { DeliveryPerson } from '../hooks/useDeliveryPersons';

interface DeliveryPersonAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (person: DeliveryPerson) => void;
    suggestions: DeliveryPerson[];
    placeholder?: string;
    label?: string;
    required?: boolean;
}

export default function DeliveryPersonAutocomplete({
    value,
    onChange,
    onSelect,
    suggestions,
    placeholder = 'Nom du livreur',
    label = 'Nom du livreur',
    required = false
}: DeliveryPersonAutocompleteProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        setShowSuggestions(true);
        setSelectedIndex(-1);
    };

    const handleSuggestionClick = (person: DeliveryPerson) => {
        onChange(person.nom);
        onSelect(person);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <input
                type="text"
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder={placeholder}
                required={required}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((person, index) => (
                        <div
                            key={index}
                            onClick={() => handleSuggestionClick(person)}
                            className={`px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${index === selectedIndex ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="font-medium text-gray-900">{person.nom}</div>
                            <div className="text-sm text-gray-600 mt-1">
                                {person.telephone} • {person.ville_depart} → {person.ville_arrivee} • {person.prix}€
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
