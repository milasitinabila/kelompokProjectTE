import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scan, CheckCircle, AlertTriangle, RefreshCcw } from "lucide-react";

export default function MoneyDetector() {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  // Fungsi untuk mengambil foto dari kamera
  const capture = useCallback(() => {
    const imageBase64 = webcamRef.current.getScreenshot();
    setImageSrc(imageBase64);
  }, [webcamRef]);

  // Fungsi pura-pura (Simulasi) mengirim gambar ke AI Backend
  const scanMoney = () => {
    setIsScanning(true);
    setResult(null);

    // Simulasi loading 2 detik seolah-olah AI sedang bekerja
    setTimeout(() => {
      setIsScanning(false);
      // Di sistem asli, di sini kamu mengirim 'imageSrc' ke API / Backend AI kamu
      // Math.random() ini cuma simulasi: 70% asli, 30% palsu
      const isReal = Math.random() > 0.3; 
      
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
    <div className="container mx-auto p-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Detektor Uang Tunai</CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            Arahkan uang ke kamera dengan pencahayaan yang cukup.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          
          {/* Tampilan Kamera / Hasil Foto */}
          <div className="relative w-full max-w-sm rounded-lg overflow-hidden border-4 border-muted bg-black aspect-video flex items-center justify-center">
            {!imageSrc ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{ facingMode: "environment" }} // Pakai kamera belakang kalau di HP
              />
            ) : (
              <img src={imageSrc} alt="Captured Money" className="w-full h-full object-cover" />
            )}

            {/* Overlay Animasi Scanning */}
            {isScanning && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <div className="w-full h-1 bg-primary animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.8)] absolute top-1/2"></div>
              </div>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-4 mt-4 w-full justify-center">
            {!imageSrc ? (
              <Button onClick={capture} size="lg" className="w-full max-w-xs">
                <Scan className="w-5 h-5 mr-2" /> Ambil Foto
              </Button>
            ) : (
              <>
                <Button onClick={retake} variant="outline" disabled={isScanning}>
                  <RefreshCcw className="w-4 h-4 mr-2" /> Ulangi
                </Button>
                <Button onClick={scanMoney} disabled={isScanning} className="w-full">
                  {isScanning ? "Menganalisis..." : "Deteksi Sekarang"}
                </Button>
              </>
            )}
          </div>

          {/* Kotak Hasil Deteksi */}
          {result && (
            <div className={`mt-6 w-full p-4 rounded-lg flex items-center gap-4 ${result.status === 'ASLI' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {result.status === 'ASLI' ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              <div>
                <h3 className="font-bold text-lg">Indikasi: Uang {result.status}</h3>
                <p className="text-sm opacity-80">Tingkat Keyakinan AI: {result.confidence}</p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}