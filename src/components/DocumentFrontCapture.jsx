import React, { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { kycApiService } from '../services/kycApi';
import { ErrorPage } from './ErrorPage';
import '../styles/DocumentCapture.css';

export const DocumentFrontCapture = ({
  onCapture,
  onNext,
  verificationId,
  onError,
  onResetError,
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isClearImage, setIsClearImage] = useState(false);
  const [captureError, setCaptureError] = useState(null);

  useEffect(() => {
    startCamera('environment');
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    setIsCapturing(true);
    const result = await captureImage();

    if (result) {
      const image = {
        blob: result.blob,
        url: result.url,
        timestamp: new Date(),
      };
      setCapturedImage(image);
      onCapture(image);
      await handleCheckQuality(image);
    } else {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage.url);
    }
    setCapturedImage(null);
    setUploadError(null);
    setIsClearImage(false);
    setCaptureError(null);
    setIsCapturing(false);
    setIsUploading(false);
    startCamera('environment');
  };

  const handleCheckQuality = async (image) => {
    if (!image) return;

    setIsUploading(true);
    setUploadError(null);
    setIsClearImage(false);
    setCaptureError(null);

    try {
      const response = await kycApiService.processDocument({
        image: image.blob,
        type: 'document-front',
        verificationId,
      });

      if (response.message === 'CLEAR IMAGE') {
        setIsClearImage(true);

        const uuid =
          'ML_' +
          (crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 15));

        const ocrResponse = await kycApiService.processOCRDocument(
          image.blob,
          uuid
        );
        stopCamera();
        onCapture(image);
        onNext();
      } else {
        setUploadError(response.message || 'Document is not clear. Please retake.');
        setCaptureError({
          type: 'validation',
          message: response.message || 'Document is not clear. Please retake.',
          tips: ['Ensure the document is fully visible.', 'Avoid glare or shadows.'],
        });
        if (onError) onError(response.message || 'Document is not clear. Please retake.');
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Network error. Please try again.';
      setUploadError(errorMessage);
      setCaptureError({
        type: 'network',
        message: errorMessage,
        tips: ['Check your internet connection.', 'Try again later.'],
      });
      if (onError) onError(errorMessage);
    } finally {
      setIsUploading(false);
    }
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
                if (onResetError) onResetError();
                handleRetake();
              }}
              onBack={() => {
                setCaptureError(null);
                if (onResetError) onResetError();
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
            <CreditCard className="icon" />
            <h1>Document Front</h1>
            <p>Align your ID front within the frame</p>
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
                    className="camera-video"
                  />
                  <div className="camera-overlay">
                    <div className="camera-frame rectangle">
                      <div className="frame-content">
                        <CreditCard size={32} />
                        <p>Align ID Front</p>
                      </div>
                    </div>
                  </div>
                  {isLoading && (
                    <div className="camera-loading">
                      <div className="loading-spinner" />
                      <span>Loading camera...</span>
                    </div>
                  )}
                </>
              ) : (
                <img
                  src={capturedImage.url}
                  alt="Document front"
                  className="camera-video"
                />
              )}
            </div>

            {uploadError && (
              <div className="alert alert-error">
                {uploadError}
              </div>
            )}

            {isUploading && (
              <div className="alert alert-info">
                <div className="processing-indicator">
                  <div className="loading-spinner" />
                  Processing document...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="btn-container">
        {!capturedImage && (
          <button
            onClick={handleCapture}
            disabled={!isStreaming || isCapturing || isUploading}
            className="btn-primary"
          >
            {isCapturing ? (
              <>
                <div className="loading-spinner" />
                Capturing...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Capture Document
              </>
            )}
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