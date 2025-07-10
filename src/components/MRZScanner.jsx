import React, { useEffect, useState } from 'react';
import { Scan } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { kycApiService } from '../services/kycApi';
import { ErrorPage } from './ErrorPage';
import '../styles/Scanner.css';

export const MRZScanner = ({ onScan, onNext, verificationId, onError }) => {
  const {
    videoRef,
    isStreaming,
    isLoading,
    error,
    startCamera,
    stopCamera,
  } = useCamera();

  const [scannedData, setScannedData] = useState(null);
  const [ocrStatus, setOcrStatus] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [captureError, setCaptureError] = useState(null);

  useEffect(() => {
    startCamera('environment');
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleScan = async () => {
    setIsScanning(true);

    if (!videoRef.current) {
      const errorMsg = 'Camera not available';
      setUploadError(errorMsg);
      setCaptureError({
        type: 'camera',
        message: errorMsg,
        tips: ['Ensure your camera is connected and accessible.', 'Try refreshing the page.'],
      });
      setIsScanning(false);
      onError?.(errorMsg);
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      const errorMsg = 'Failed to get canvas context';
      setUploadError(errorMsg);
      setCaptureError({
        type: 'processing',
        message: errorMsg,
        tips: ['Try restarting the application.', 'Ensure your browser supports canvas.'],
      });
      setIsScanning(false);
      onError?.(errorMsg);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        const errorMsg = 'Failed to capture image';
        setUploadError(errorMsg);
        setCaptureError({
          type: 'processing',
          message: errorMsg,
          tips: ['Try again.', 'Ensure good lighting conditions.'],
        });
        setIsScanning(false);
        onError?.(errorMsg);
        return;
      }

      setUploadError(null);
      setOcrStatus(null);
      setScannedData(null);
      setCaptureError(null);

      try {
        const response = await kycApiService.processMRZDocument(blob, verificationId);
        if (response.success && response.data?.status === 'success') {
          const mrzData = JSON.stringify(response.data.parsed_data, null, 2);
          setScannedData(mrzData);
          setOcrStatus('SUCCESSFUL');
          onScan(mrzData);
          stopCamera();
          onNext();
        } else {
          const errorMsg = 'OCR failed or status not successful.';
          setUploadError(errorMsg);
          setCaptureError({
            type: 'processing',
            message: errorMsg,
            tips: ['Ensure MRZ area is clearly visible.', 'Try again with better lighting.'],
          });
          setOcrStatus(null);
          onError?.(errorMsg);
        }
      } catch (error) {
        const errorMsg = error?.message || 'Network error. Please try again.';
        setUploadError(errorMsg);
        setCaptureError({
          type: 'network',
          message: errorMsg,
          tips: ['Check your internet connection.', 'Try again later.'],
        });
        onError?.(errorMsg);
      } finally {
        setIsScanning(false);
      }
    }, 'image/jpeg');
  };

  const handleRetry = () => {
    setScannedData(null);
    setOcrStatus(null);
    setIsScanning(false);
    setUploadError(null);
    setCaptureError(null);
    startCamera('environment');
  };

  if (captureError) {
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
            <ErrorPage
              error={captureError}
              onRetry={handleRetry}
              onBack={handleRetry}
            />
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
  }

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
          <div className="card-header mrz-header">
            <Scan className="icon" />
            <h1>Scan MRZ Code</h1>
            <p>Position the MRZ area at the bottom of your ID</p>
          </div>

          <div className="card-body">
            <div className="camera-container">
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
              <div className="camera-overlay">
                <div className="camera-frame barcode">
                  <div className="frame-content">
                    <Scan size={20} />
                    <p>MRZ Scan Area</p>
                  </div>
                </div>
              </div>

              {(isLoading || isScanning) && (
                <div className="camera-loading">
                  <div className="loading-spinner" />
                  <span>{isScanning ? 'Scanning...' : 'Loading camera...'}</span>
                </div>
              )}
            </div>

            {ocrStatus === 'SUCCESSFUL' && (
              <div className="alert alert-success">
                <strong>MRZ Status: SUCCESSFUL</strong>
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {uploadError && (
              <div className="alert alert-error">
                {uploadError}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="btn-container">
        {ocrStatus !== 'SUCCESSFUL' ? (
          <button
            onClick={handleScan}
            disabled={!isStreaming || isScanning}
            className="btn-primary"
          >
            {isScanning ? (
              <>
                <div className="loading-spinner" />
                Scanning...
              </>
            ) : (
              <>
                <Scan size={20} />
                Scan MRZ
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="btn-secondary"
          >
            Retry
          </button>
        )}
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