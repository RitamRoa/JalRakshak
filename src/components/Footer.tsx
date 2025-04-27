import { Droplet, Mail, Phone, Github as GitHub, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Droplet className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-xl font-display font-bold">{t('appName')}</span>
            </div>
            <p className="text-gray-300 text-sm">
              Empowering communities to solve water issues together. Report, track, and resolve water problems in your area.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <GitHub size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter size={20} />
              </a>
              <a href="mailto:info@communitywaterwatch.org" className="text-gray-400 hover:text-white transition">
                <Mail size={20} />
              </a>
              <a href="tel:+911234567890" className="text-gray-400 hover:text-white transition">
                <Phone size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-gray-300 hover:text-white transition">
                  {t('nav.report')}
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-gray-300 hover:text-white transition">
                  {t('nav.map')}
                </Link>
              </li>
              <li>
                <Link to="/action-plan" className="text-gray-300 hover:text-white transition">
                  {t('nav.actionPlan')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Water Conservation Tips
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Government Water Schemes
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Water Safety Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Emergency Response Plan
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-primary-400" />
                <span>Water Emergency: +91-11-12345678</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-primary-400" />
                <span>Flood Control: +91-11-87654321</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 text-primary-400" />
                <span>emergency@waterwatch.org</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Community Water Watch. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;