'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Composant pour l'indicateur de force du mot de passe
function PasswordStrengthIndicator({ password }: { password: string }) {
    const getStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        return strength;
    };

    const strength = getStrength();
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];

    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded ${i < strength ? colors[strength - 1] : 'bg-gray-200'}`}
                    />
                ))}
            </div>
            <p className={`text-xs ${strength < 3 ? 'text-red-600' : strength < 4 ? 'text-yellow-600' : 'text-green-600'}`}>
                Force : {labels[strength - 1] || 'Aucune'}
            </p>
        </div>
    );
}

export default function RegisterPage() {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'LIVREUR_GP' as 'EXPEDITEUR' | 'LIVREUR_GP'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Validation du formulaire avec règles strictes
     */
    const validateForm = () => {
        // Champs requis
        if (!formData.full_name || !formData.email || !formData.password) {
            setError('Tous les champs obligatoires doivent être remplis');
            return false;
        }

        // Validation nom
        if (formData.full_name.length < 2) {
            setError('Le nom doit contenir au moins 2 caractères');
            return false;
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Adresse email invalide');
            return false;
        }

        // Validation mot de passe STRICTE (conforme au backend)
        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return false;
        }
        if (!/[a-z]/.test(formData.password)) {
            setError('Le mot de passe doit contenir au moins une lettre minuscule');
            return false;
        }
        if (!/[A-Z]/.test(formData.password)) {
            setError('Le mot de passe doit contenir au moins une lettre majuscule');
            return false;
        }
        if (!/[0-9]/.test(formData.password)) {
            setError('Le mot de passe doit contenir au moins un chiffre');
            return false;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
            setError('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*...)');
            return false;
        }



        return true;
    };

    /**
     * Gestion de la soumission du formulaire
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Préparer les données
            const dataToSend = {
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            };

            await register(dataToSend);
            // La redirection est gérée par le AuthContext
        } catch (err: any) {
            setError(err.message || "Erreur d'inscription");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Créer un compte
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Ou{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            se connecter
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md text-sm">
                            <p className="font-medium">Erreur</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Sélection du rôle */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                Je suis : <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="role"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'EXPEDITEUR' | 'LIVREUR_GP' })}
                                disabled={loading}
                            >
                                <option value="EXPEDITEUR">🎁 Expéditeur (Je veux envoyer un colis)</option>
                                <option value="LIVREUR_GP">🚚 Livreur GP (Je voyage et je transporte)</option>
                            </select>
                        </div>

                        {/* Nom complet */}
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Nom complet <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="full_name"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
                                placeholder="Jean Dupont"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                disabled={loading}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Adresse email <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
                                placeholder="jean@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                disabled={loading}
                            />
                        </div>



                        {/* Mot de passe avec indicateur de force */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <PasswordStrengthIndicator password={formData.password} />
                            <p className="mt-2 text-xs text-gray-500">
                                Min. 8 caractères, avec majuscule, minuscule, chiffre et caractère spécial
                            </p>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Inscription en cours...
                                </span>
                            ) : (
                                "S'inscrire"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
