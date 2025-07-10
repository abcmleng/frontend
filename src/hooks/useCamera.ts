import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async (mode: 'user' | 'environment' = 'user') => {
    setIsLoading(true);
    setError(null);
    setFacingMode(mode);

    // Stop any active streams before starting new
    stopCamera();

    try {
      // Try with constraints (including facingMode)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err: any) {
      // If facingMode exact fails, try without exact constraint as fallback
      if (err.name === 'OverconstrainedError' || err.name === 'NotFoundError') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true // less strict
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setIsStreaming(true);
            setFacingMode('user'); // fallback to user
          }
        } catch (err2: any) {
          setError('Camera not accessible: ' + err2.message);
          console.error('Camera fallback error:', err2);
        }
      } else if (err.name === 'NotReadableError') {
        setError('Camera is already in use by another application.');
        console.error('Camera NotReadableError:', err);
      } else if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions.');
      } else {
        setError('Camera error: ' + err.message);
        console.error('Camera error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [stopCamera]);

  const captureImage = useCallback((): Promise<{ blob: Blob; url: string } | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !isStreaming) {
        resolve(null);
        return;
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        resolve(null);
        return;
      }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      if (facingMode === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }

      context.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve({ blob, url });
        } else {
          resolve(null);
        }
      }, 'image/jpeg', 0.8);
    });
  }, [isStreaming, facingMode]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isStreaming,
    isLoading,
    error,
    startCamera,
    stopCamera,
    captureImage
  };
};