'use client';

import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VerifyEmailNoticePage() {
    const { user, isEmailVerified } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Si déjà vérifié, rediriger
        if (isEmailVerified) {
            router.push('/dashboard');
        }
    }, [isEmailVerified, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl text-center">
                <div>
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                        <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Vérifiez votre email
                    </h2>
                    <p className="mt-4 text-center text-gray-600">
                        Un email de vérification a été envoyé à <strong>{user?.email}</strong>
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                        <h3 className="font-semibold text-blue-900 mb-2">📧 Prochaines étapes :</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                            <li>Consultez votre boîte de réception</li>
                            <li>Cliquez sur le lien de vérification</li>
                            <li>Revenez ici pour commencer à utiliser GP</li>
                        </ol>
                    </div>

                    <p className="text-sm text-gray-500">
                        Vous n'avez pas reçu l'email ? Vérifiez vos spams ou{' '}
                        <Link href="/resend-verification" className="font-medium text-blue-600 hover:text-blue-500">
                            renvoyer l'email
                        </Link>
                    </p>

                    <div className="pt-4">
                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            ← Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
