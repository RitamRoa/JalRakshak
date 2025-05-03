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
              {t('footer.description')}
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
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
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
            <h3 className="text-lg font-semibold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  {t('footer.waterConservationTips')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  {t('footer.govtWaterSchemes')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  {t('footer.waterSafetyGuidelines')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  {t('footer.emergencyResponsePlan')}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.emergencyContact')}</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-primary-400" />
                <span>{t('footer.waterEmergency')}: +91-11-12345678</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-primary-400" />
                <span>{t('footer.floodControl')}: +91-11-87654321</span>
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
            © {new Date().getFullYear()} {t('appName')}. {t('footer.rights')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-400 hover:text-white transition">
              {t('footer.privacy')}
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition">
              {t('footer.terms')}
            </a>
            <a href="#" className="text-sm text-gray-400 hover:text-white transition">
              {t('footer.cookies')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;