import React from 'react';
import { Globe } from 'lucide-react';
import metadata from '../helper/metadata.json';

interface CountrySelectionProps {
  selectedCountryCode: string | null;
  onSelectCountryCode: (countryCode: string) => void;
  onNext: () => void;
}
export const CountrySelection: React.FC<CountrySelectionProps> = ({
  selectedCountryCode,
  onSelectCountryCode,
  onNext,
}) => {
  // Extract unique countries with country_code and country name
  const countries = Array.from(
    new Map(
      (metadata as { country: string; country_code: string }[]).map((item) => [
        item.country_code,
        item.country,
      ])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onSelectCountryCode(value);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center p-3 min-h-0 overflow-hidden">
        <div className="w-full max-w-md mx-auto">
        {/** header image logo inside the main page */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex justify-center">
        <img
            className="h-6"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>
          
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            
            {/* Title Section */}
            <div className="bg-blue-600 px-4 py-4 text-center">
              <Globe className="w-8 h-8 mx-auto mb-2 text-white" />
              <h1 className="text-lg font-bold text-white mb-1">Select Your Country</h1>
              <p className="text-blue-100 text-xs">Choose your country to continue verification</p>
            </div>

            {/* Selection Section */}
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country of Document
                </label>
                <select
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                  value={selectedCountryCode || ''}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select a country
                  </option>
                  {countries.map(([code, name]) => (
                    <option key={code} value={code} className="py-2">
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCountryCode && (
                <>
             
                  <div className="mt-4 text-center">
                    <button
                      onClick={onNext}
                      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}

              <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2">
              <div className="flex justify-center items-center gap-0">
                <span className="text-xs text-gray-500">Powered by</span>
                <img
                  className="h-4"
                  src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
                  alt="IDMerit Logo"
                />
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      
    </div>
  );
};