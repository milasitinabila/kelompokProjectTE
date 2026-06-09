import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan, CheckCircle, AlertTriangle, RefreshCcw, X } from "lucide-react";

export default function MoneyDetector({ onClose }) {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const capture = useCallback(() => {
    const imageBase64 = webcamRef.current.getScreenshot();
    setImageSrc(imageBase64);
  }, [webcamRef]);

  const scanMoney = () => {
    setIsScanning(true);
    setResult(null);

    // Simulasi proses AI selama 2 detik
    setTimeout(() => {
      setIsScanning(false);
      const isReal = Math.random() > 0.3; // 70% asli, 30% palsu (hanya simulasi)
      
      setResult({
        status: isReal ? 'ASLI' : 'PALSU',
        confidence: (Math.random() * (99 - 85) + 85).toFixed(1) + '%',
      });
    }, 2000);
  };

  const retake = () => {
    setImageSrc(null);
    setResult(null);
  };

  return (
    // Background gelap yang menutupi layar
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md relative shadow-2xl">
        {/* Tombol Tutup (X) di pojok kanan atas */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-black"
        >
          <X className="w-6 h-6" />
        </button>

        <CardHeader>
          <CardTitle className="text-center text-xl">Scanner Uang Tunai</CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative w-full rounded-lg overflow-hidden border-4 border-muted bg-black aspect-video flex items-center justify-center">
            {!imageSrc ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: "environment" }}
              />
            ) : (
              <img src={imageSrc} alt="Uang di-scan" className="w-full h-full object-cover" />
            )}

            {/* Animasi loading biru */}
            {isScanning && (
              <div className="absolute inset-0 bg-blue-500/20 flex flex-col items-center justify-center">
                <div className="w-full h-1 bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.8)] absolute top-1/2"></div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-2 w-full justify-center">
            {!imageSrc ? (
              <Button onClick={capture} className="w-full">
                <Scan className="w-4 h-4 mr-2" /> Ambil Gambar
              </Button>
            ) : (
              <>
                <Button onClick={retake} variant="outline" disabled={isScanning} className="w-1/2">
                  <RefreshCcw className="w-4 h-4 mr-2" /> Ulangi
                </Button>
                <Button onClick={scanMoney} disabled={isScanning} className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white">
                  {isScanning ? "Menganalisis..." : "Deteksi"}
                </Button>
              </>
            )}
          </div>

          {result && (
            <div className={`mt-2 w-full p-3 rounded-md flex items-center gap-3 ${result.status === 'ASLI' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {result.status === 'ASLI' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              <div>
                <h3 className="font-bold">Uang {result.status}</h3>
                <p className="text-xs">Akurasi AI: {result.confidence}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}