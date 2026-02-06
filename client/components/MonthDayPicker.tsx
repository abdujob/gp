'use client';

import { useState, useEffect } from 'react';

interface MonthDayPickerProps {
    value: string; // ISO date format YYYY-MM-DD
    onChange: (date: string) => void;
    label?: string;
    required?: boolean;
}

const MONTHS = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
];

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 2026 is not a leap year but keeping 29 for Feb for safety

export default function MonthDayPicker({
    value,
    onChange,
    label = 'Date disponible',
    required = false
}: MonthDayPickerProps) {
    const [month, setMonth] = useState<number>(0);
    const [day, setDay] = useState<number>(0);

    // Parse initial value
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            setMonth(date.getMonth() + 1);
            setDay(date.getDate());
        }
    }, [value]);

    // Update parent when month or day changes
    useEffect(() => {
        if (month > 0 && day > 0) {
            const monthStr = month.toString().padStart(2, '0');
            const dayStr = day.toString().padStart(2, '0');
            const dateStr = `2026-${monthStr}-${dayStr}`;
            onChange(dateStr);
        }
    }, [month, day, onChange]);

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value);
        setMonth(newMonth);

        // Reset day if current day is invalid for new month
        if (newMonth > 0 && day > DAYS_IN_MONTH[newMonth - 1]) {
            setDay(DAYS_IN_MONTH[newMonth - 1]);
        }
    };

    const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDay(parseInt(e.target.value));
    };

    const maxDays = month > 0 ? DAYS_IN_MONTH[month - 1] : 31;

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="grid grid-cols-2 gap-3">
                {/* Month Selector */}
                <div>
                    <select
                        value={month}
                        onChange={handleMonthChange}
                        required={required}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={0}>Mois</option>
                        {MONTHS.map(m => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Day Selector */}
                <div>
                    <select
                        value={day}
                        onChange={handleDayChange}
                        required={required}
                        disabled={month === 0}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value={0}>Jour</option>
                        {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {month > 0 && day > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                    Date sélectionnée : {day} {MONTHS[month - 1].label} 2026
                </p>
            )}
        </div>
    );
}
