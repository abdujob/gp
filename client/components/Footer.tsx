import { Package } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <Package className="w-8 h-8 text-accent" />
                    <span>SendVoyage</span>
                </div>

                <div className="flex gap-8 text-sm text-gray-400">
                    <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
                    <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>

                <div className="text-sm text-gray-500">
                    © {new Date().getFullYear()} SendVoyage. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
