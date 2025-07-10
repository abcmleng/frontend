import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { kycApiService } from '../services/kycApi';
import { ErrorPage } from './ErrorPage';
import '../styles/SelfieCapture.css';

export const SelfieCapture = ({
  onCapture,
  onNext,
  verificationId,
  onError,
}) => {
  const {
    videoRef,
    isStreaming,
    isLoading,
    startCamera,
    stopCamera,
    captureImage,
  } = useCamera();

  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [captureError, setCaptureError] = useState(null);

  useEffect(() => {
    startCamera('user');
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    setIsCapturing(true);
    const result = await captureImage();
    if (result) {
      const image = { blob: result.blob, url: result.url, timestamp: new Date() };
      setCapturedImage(image);
      onCapture?.(image);
      await handleUpload(image);
    }
    setIsCapturing(false);
  };

  const handleUpload = async (image) => {
    setUploadError(null);
    setCaptureError(null);
    try {
      const response = await kycApiService.processImage({
        image: image.blob,
        type: 'selfie',
        verificationId,
      });
      if (!response || !response.live) throw new Error('No face detected. Please try again.');
      if (response.live === 'FAKE') throw new Error(response.message || 'Fake face detected.');
      if (response.live !== 'REAL') throw new Error(response.message || 'Face verification failed.');

      stopCamera();
      onNext();
    } catch (error) {
      const msg = error?.message || 'Network error. Please try again.';
      setUploadError(msg);
      setCaptureError({
        type: 'network',
        message: msg,
        tips: ['Check your internet connection.', 'Try again later.'],
      });
      onError?.(msg);
    }
  };

  const handleRetake = () => {
    if (capturedImage) URL.revokeObjectURL(capturedImage.url);
    setCapturedImage(null);
    setUploadError(null);
    setCaptureError(null);
    startCamera('user');
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
              onRetry={() => {
                setCaptureError(null);
                handleRetake();
              }}
              onBack={() => {
                setCaptureError(null);
                handleRetake();
              }}
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
          <div className="card-header">
            <Camera className="icon" />
            <h1>Take Your Selfie</h1>
            <p>Position your face within the oval frame</p>
          </div>

          <div className="card-body">
            <div className="camera-container">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="camera-video selfie-mirror"
                  />
                  <div className="camera-overlay">
                    <div className="camera-frame oval" />
                  </div>

                  {isLoading && (
                    <div className="camera-loading">
                      <div className="loading-spinner" />
                      <span>Loading camera...</span>
                    </div>
                  )}
                </>
              ) : (
                <img src={capturedImage.url} alt="Captured selfie" className="camera-video" />
              )}
            </div>

            {uploadError && (
              <div className="alert alert-error">
                {uploadError}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="btn-container">
        {!capturedImage ? (
          <button
            onClick={handleCapture}
            disabled={!isStreaming || isCapturing}
            className="btn-primary"
          >
            {isCapturing ? (
              <>
                <div className="loading-spinner" />
                Capturing...
              </>
            ) : (
              <>
                <Camera size={20} />
                Take Selfie
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleRetake}
            className="btn-secondary"
          >
            Retake Photo
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