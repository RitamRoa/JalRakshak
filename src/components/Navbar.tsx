import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Droplet, Menu, X, MapPin, FileText, LifeBuoy, Shield, UserCircle, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    closeMenu();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    closeMenu();
  };

  const navLinks = [
    { to: '/', label: t('nav.home'), icon: <Droplet size={20} /> },
    { to: '/report', label: t('nav.report'), icon: <FileText size={20} /> },
    { to: '/map', label: t('nav.map'), icon: <MapPin size={20} /> },
    { to: '/action-plan', label: t('nav.actionPlan'), icon: <LifeBuoy size={20} /> },
  ];

  if (isAuthenticated) {
    navLinks.push({ to: '/my-reports', label: t('nav.myReports'), icon: <FileText size={20} /> });
  }

  if (isAdmin) {
    navLinks.push({ to: '/admin', label: t('nav.admin'), icon: <Shield size={20} /> });
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
              <Droplet className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-display font-bold text-gray-900">
                {t('appName')}
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                  location.pathname === link.to
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            <div className="ml-4 flex items-center space-x-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs rounded-md ${
                  i18n.language === 'en'
                    ? 'bg-primary-100 text-primary-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                className={`px-2 py-1 text-xs rounded-md ${
                  i18n.language === 'hi'
                    ? 'bg-primary-100 text-primary-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                HI
              </button>
              <button
                onClick={() => changeLanguage('kn')}
                className={`px-2 py-1 text-xs rounded-md ${
                  i18n.language === 'kn'
                    ? 'bg-primary-100 text-primary-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                KN
              </button>
            </div>

            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <button
                    onClick={handleSignOut}
                    className="ml-2 flex items-center text-sm px-3 py-2 rounded-md font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <LogOut size={18} className="mr-1.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/signup"
                  className="flex items-center text-sm px-3 py-2 rounded-md font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  <UserPlus size={18} className="mr-1.5" />
                  <span>Sign Up</span>
                </Link>
                <Link
                  to="/admin/login"
                  className="flex items-center text-sm px-3 py-2 rounded-md font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  <UserCircle size={18} className="mr-1.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  location.pathname === link.to
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={closeMenu}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}

            <div className="flex items-center space-x-2 px-3 py-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 text-sm rounded-md ${
                  i18n.language === 'en'
                    ? 'bg-primary-100 text-primary-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                className={`px-3 py-1 text-sm rounded-md ${
                  i18n.language === 'hi'
                    ? 'bg-primary-100 text-primary-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => changeLanguage('kn')}
                className={`px-3 py-1 text-sm rounded-md ${
                  i18n.language === 'kn'
                    ? 'bg-primary-100 text-primary-800 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center"
              >
                <LogOut size={20} className="mr-2" />
                Sign Out
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/signup"
                  className="flex items-center text-sm px-3 py-2 rounded-md font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  <UserPlus size={18} className="mr-1.5" />
                  <span>Sign Up</span>
                </Link>
                <Link
                  to="/admin/login"
                  className="flex items-center text-sm px-3 py-2 rounded-md font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  <UserCircle size={18} className="mr-1.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;