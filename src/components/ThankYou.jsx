import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, RefreshCw } from 'lucide-react';
import '../styles/ThankYou.css';

export const ThankYou = ({ kycData, onRestart, scannerType }) => {
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsProcessing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownloadReport = () => {
    const report = {
      verificationId: kycData.verificationId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      documents: {
        selfie: !!kycData.selfie,
        documentFront: !!kycData.documentFront,
        documentBack: !!kycData.documentBack,
        mrzScan: !!kycData.mrzData
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kyc-verification-${kycData.verificationId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          {isProcessing ? (
            <div className="processing-content">
              <div className="processing-spinner">
                <div className="loading-spinner large" />
              </div>
              <h2>Processing Verification</h2>
              <p>Please wait while we verify your documents...</p>
              <div className="progress-bar">
                <div className="progress-fill" />
              </div>
            </div>
          ) : (
            <>
              <div className="card-header success-header">
                <CheckCircle className="icon" />
                <h1>Verification Complete!</h1>
                <p>Your KYC verification has been successfully processed</p>
                {scannerType === 'mrz' && (
                  <p className="scan-type">MRZ Scan Completed</p>
                )}
                {scannerType === 'barcode' && (
                  <p className="scan-type">Barcode Scan Completed</p>
                )}
              </div>

              <div className="card-body">
                <div className="verification-summary">
                  <h3>Verification Summary</h3>
                  <div className="summary-items">
                    <div className="summary-item">
                      <span>Verification ID:</span>
                      <span className="verification-id">{kycData.verificationId}</span>
                    </div>
                    <div className="summary-item">
                      <span>Selfie:</span>
                      <span className="status-success">✓ Captured</span>
                    </div>
                    <div className="summary-item">
                      <span>Document Front:</span>
                      <span className="status-success">✓ Captured</span>
                    </div>
                    <div className="summary-item">
                      <span>Document Back:</span>
                      <span className="status-success">✓ Captured</span>
                    </div>
                    <div className="summary-item">
                      <span>ID Scan:</span>
                      <span className="status-success">✓ Completed</span>
                    </div>
                  </div>
                </div>

                <div className="completion-message">
                  <p>Verification completed successfully</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {!isProcessing && (
        <div className="btn-container">
          <button
            onClick={handleDownloadReport}
            className="btn-primary"
          >
            <Download size={20} />
            Download Report
          </button>
          
          <button
            onClick={onRestart}
            className="btn-secondary"
          >
            <RefreshCw size={20} />
            Start New Verification
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