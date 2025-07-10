import React from 'react';
import '../styles/ErrorPage.css';

const getErrorIcon = (type) => {
  switch (type) {
    case 'camera':
      return <span role="img" aria-label="camera" className="error-emoji">📷</span>;
    case 'network':
      return <span role="img" aria-label="network" className="error-emoji">📡</span>;
    default:
      return <span role="img" aria-label="alert" className="error-emoji">⚠️</span>;
  }
};

const getErrorTitle = (type) => {
  switch (type) {
    case 'camera':
      return 'Camera Access Required';
    case 'processing':
      return 'Processing Failed';
    case 'network':
      return 'Connection Error';
    case 'validation':
      return 'Validation Error';
    default:
      return 'Something Went Wrong';
  }
};

export const ErrorPage = ({ error, onRetry }) => {
  console.log('[ErrorPage] Displaying error:', error);

  return (
    <div className="error-page">
      <div className="error-icon">
        {getErrorIcon(error.type)}
      </div>
      
      <h2 className="error-title">
        {getErrorTitle(error.type)}
      </h2>
      
      <p className="error-message">
        {error.message}
      </p>

      {error.tips.length > 0 && (
        <div className="error-tips">
          <h3>Tips for better results:</h3>
          <ul>
            {error.tips.map((tip, index) => (
              <li key={index}>
                <span className="tip-bullet">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="error-actions">
        <button
          onClick={onRetry}
          className="btn-primary"
        >
          <span>&#x21bb;</span>
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};