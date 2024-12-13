import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PaymentFailed: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <Link 
        to="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </Link>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6"
          >
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white text-center mb-4">
            Payment Failed
          </h1>
          
          <p className="text-gray-400 text-center mb-8">
            We couldn't process your payment. Don't worry, no charges were made to your account.
          </p>

          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Common Issues:</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                  <span>Insufficient funds or card declined</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                  <span>Incorrect card information</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                  <span>Bank security verification required</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/store"
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg 
                         hover:bg-indigo-700 transition-colors text-center"
              >
                Try Again
              </Link>
              <a
                href="mailto:support@trackhab.me"
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg 
                         hover:bg-gray-600 transition-colors text-center flex items-center justify-center gap-2"
              >
                <HelpCircle className="w-5 h-5" />
                Contact Support
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};