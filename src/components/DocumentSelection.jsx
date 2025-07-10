import React from 'react';
import { FileText } from 'lucide-react';
import metadata from '../helper/metadata.json';
import '../styles/DocumentSelection.css';

const typeLabelMap = {
  PP: 'Passport',
  DL: 'Driving License',
  NI: 'National ID',
  AADHAAR: 'Aadhaar',
};

export const DocumentSelection = ({
  selectedCountryCode,
  selectedDocumentType,
  onSelectDocumentType,
  onNext,
}) => {
  // Filter document types based on selected country code from metadata
  const documentTypes = React.useMemo(() => {
    if (!selectedCountryCode) return [];

    const docs = metadata
      .filter((item) => item.country_code === selectedCountryCode)
      .map((item) => {
        const type = item.type || item.alternative_text || '';
        const label = typeLabelMap[type.toUpperCase()] || item.alternative_text || type;
        return {
          label,
          value: type,
        };
      });

    // Remove duplicates by value
    const uniqueDocs = Array.from(new Map(docs.map(doc => [doc.value.toLowerCase(), doc])).values());

    return uniqueDocs;
  }, [selectedCountryCode]);

  const handleDocumentSelect = (docType) => {
    onSelectDocumentType(docType);
    setTimeout(() => onNext(), 100);
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
            <FileText className="icon" />
            <h1>Select Document Type</h1>
            <p>Choose the type of document you want to verify</p>
          </div>

          <div className="card-body">
            {documentTypes.length === 0 ? (
              <div className="no-documents">
                <p>No document types available for the selected country.</p>
              </div>
            ) : (
              <div className="document-options">
                {documentTypes.map((docType) => (
                  <button
                    key={docType.value}
                    className="document-option"
                    onClick={() => handleDocumentSelect(docType.value)}
                  >
                    <div className="document-option-content">
                      <div>
                        <h3>{docType.label}</h3>
                        <p>Verify your {docType.label.toLowerCase()}</p>
                      </div>
                      <div className="document-option-radio"></div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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