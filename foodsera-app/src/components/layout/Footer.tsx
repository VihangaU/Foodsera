
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8">
      <div className="foodix-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h5 className="text-xl font-bold mb-4">Foodix</h5>
            <p className="text-gray-300 mb-4">
              Connecting you to the best restaurants in your area, delivering
              your favorite meals right to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-foodix-400">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-foodix-400">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-foodix-400">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xl font-bold mb-4">Quick Links</h5>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-foodix-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="text-gray-300 hover:text-foodix-400">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 hover:text-foodix-400">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-foodix-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-foodix-400">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Restaurants */}
          <div>
            <h5 className="text-xl font-bold mb-4">For Restaurants</h5>
            <ul className="space-y-2">
              <li>
                <Link to="/partner" className="text-gray-300 hover:text-foodix-400">
                  Partner with us
                </Link>
              </li>
              <li>
                <Link to="/restaurant/register" className="text-gray-300 hover:text-foodix-400">
                  Register Restaurant
                </Link>
              </li>
              <li>
                <Link to="/restaurant/login" className="text-gray-300 hover:text-foodix-400">
                  Restaurant Login
                </Link>
              </li>
              <li>
                <Link to="/restaurant/dashboard" className="text-gray-300 hover:text-foodix-400">
                  Restaurant Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-xl font-bold mb-4">Contact Us</h5>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 text-foodix-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  SLIIT MALABE
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-foodix-400" />
                <span className="text-gray-300">0777777777</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-foodix-400" />
                <span className="text-gray-300">support@foodix.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Foodix. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/terms" className="hover:text-foodix-400">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-foodix-400">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
