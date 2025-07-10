import React from 'react';
import { Globe } from 'lucide-react';
import metadata from '../helper/metadata.json';
import '../styles/CountrySelection.css';

export const CountrySelection = ({
  selectedCountryCode,
  onSelectCountryCode,
  onNext,
}) => {
  // Extract unique countries with country_code and country name
  const countries = Array.from(
    new Map(
      metadata.map((item) => [
        item.country_code,
        item.country,
      ])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const handleChange = (event) => {
    const value = event.target.value;
    onSelectCountryCode(value);
  };

  return (
    <div className="page-layout">
      <div className="page-header">
        <img
          className="logo"
          src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
          alt="IDMerit Logo"
        />
      </div>

      <div className="page-content">
        <div className="content-card">
          <div className="card-header">
            <Globe className="icon" />
            <h1>Select Your Country</h1>
            <p>Choose your country to continue verification</p>
          </div>

          <div className="card-body">
            <div className="form-group">
              <label className="form-label">
                Country of Document
              </label>
              <select
                className="form-select"
                value={selectedCountryCode || ''}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select a country
                </option>
                {countries.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {selectedCountryCode && (
        <div className="btn-container">
          <button onClick={onNext} className="btn-primary">
            <span>Continue</span>
          </button>
        </div>
      )}

      <div className="page-footer">
        <div className="powered-by">
          <span>Powered by</span>
          <img
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>
    </div>
  );
};