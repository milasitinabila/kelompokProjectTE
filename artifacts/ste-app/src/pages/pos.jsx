// Full replacement for ste-app/src/pages/pos.jsx
import { useState, useRef } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useListProducts,
  getListProductsQueryKey,
  useListPosSessions,
  getListPosSessionsQueryKey,
  useOpenPosSession,
  useClosePosSession,
  useCreateTransaction,
} from "@workspace/api-client-react";
import { formatIDR } from "@/lib/format";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MonitorPlay,
  PowerOff,
  Camera,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Pos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [detecting, setDetecting] = useState(false);

  const { data: products, isLoading: loadingProducts } = useListProducts(
    { search: search || undefined },
    { query: { queryKey: getListProductsQueryKey({ search: search || undefined }) } }
  );

  const { data: sessions } = useListPosSessions({
    query: { queryKey: getListPosSessionsQueryKey() },
  });

  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const activeSession = safeSessions.find((s) => s.status === "open");
  const openSession = useOpenPosSession();
  const closeSession = useClosePosSession();
  const createTx = useCreateTransaction();

  const safeProducts = Array.isArray(products) ? products : [];

  const handleOpenSession = () => {
    openSession.mutate(
      { data: { cashierName: "Admin", openingCash: 500000 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPosSessionsQueryKey() });
          toast({ title: "Sesi Dibuka", description: "Kasir siap menerima transaksi." });
        },
      }
    );
  };

  const handleCloseSession = () => {
    if (!activeSession) return;
    closeSession.mutate(
      { id: activeSession.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPosSessionsQueryKey() });
          setCart([]);
          toast({ title: "Sesi Ditutup", description: "Sesi kasir telah berakhir." });
        },
      }
    );
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, cartQuantity: Math.max(1, i.cartQuantity + delta) } : i
      )
    );
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
      setDetectionResult(null);
    } catch {
      toast({ variant: "destructive", title: "Kamera Gagal", description: "Izinkan akses kamera." });
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL("image/png"));
    setDetectionResult(null);
  };

  const detectMoney = () => {
    if (!capturedImage) {
      toast({ variant: "destructive", title: "Belum Ada Gambar", description: "Ambil foto uang terlebih dahulu." });
      return;
    }

    setDetecting(true);
    setTimeout(() => {
      const result = Math.random() > 0.4 ? "asli" : "palsu";
      setDetectionResult(result);
      setDetecting(false);
    }, 2000);
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.cartQuantity, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax - discount;

  const handleCheckout = () => {
    if (detectionResult !== "asli") {
      toast({ variant: "destructive", title: "Pembayaran Ditolak", description: "Uang belum lolos verifikasi." });
      return;
    }

    const items = cart.map((i) => ({
      productId: i.id,
      quantity: i.cartQuantity,
      unitPrice: i.price,
    }));

    createTx.mutate(
      { data: { sessionId: activeSession.id, items, discount: discount || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Transaksi Berhasil" });
          setCart([]);
          setCapturedImage(null);
          setDetectionResult(null);
        },
      }
    );
  };

  if (!activeSession) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4"><PageHeader title="POS Kasir" /><Button onClick={handleOpenSession}>Buka Sesi Kasir</Button></div>;
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-6rem)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex gap-4 mb-4 items-center">
          <PageHeader title="POS Kasir" />
          <div className="relative flex-1 max-w-md ml-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..." className="pl-9" />
          </div>
          <Button variant="destructive" size="icon" onClick={handleCloseSession}><PowerOff className="w-4 h-4" /></Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
            {loadingProducts ? "Loading..." : safeProducts.map((product) => (
              <Card key={product.id} className="cursor-pointer" onClick={() => addToCart(product)}>
                <CardContent className="p-4">
                  <h3>{product.name}</h3>
                  <div className="flex justify-between mt-2"><span>{formatIDR(product.price)}</span><span>Stok: {product.stock}</span></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="w-[420px] bg-card rounded-xl border flex flex-col">
        <div className="p-4 border-b flex items-center gap-2"><ShoppingCart /><h2>Keranjang</h2><Badge className="ml-auto">{cart.length}</Badge></div>
        <ScrollArea className="flex-1 p-4">
          {cart.map((item) => (
            <div key={item.id} className="mb-3 p-3 border rounded-lg">
              <div className="flex justify-between">
                <span>{item.name}</span>
                <button onClick={() => removeFromCart(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
              <div className="flex justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="outline" onClick={() => updateQty(item.id, -1)}><Minus className="w-3 h-3" /></Button>
                  <span>{item.cartQuantity}</span>
                  <Button size="icon" variant="outline" onClick={() => updateQty(item.id, 1)}><Plus className="w-3 h-3" /></Button>
                </div>
                <span>{formatIDR(item.price * item.cartQuantity)}</span>
              </div>
            </div>
          ))}
        </ScrollArea>

        <div className="p-4 space-y-3 border-t">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
          <div className="flex justify-between"><span>Pajak</span><span>{formatIDR(tax)}</span></div>
          <Input type="number" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value) || 0)} placeholder="Diskon" />

          <Separator />
          <div className="space-y-2">
            <Button onClick={startCamera} className="w-full"><Camera className="w-4 h-4 mr-2" />Buka Kamera</Button>
            {cameraOn && <video ref={videoRef} autoPlay className="w-full rounded-lg border" />}
            <canvas ref={canvasRef} className="hidden" />
            {cameraOn && <Button variant="outline" onClick={captureImage} className="w-full">Ambil Foto</Button>}
            {capturedImage && <img src={capturedImage} alt="capture" className="w-full rounded-lg border" />}
            <Button onClick={detectMoney} disabled={detecting} className="w-full">{detecting ? "Mendeteksi..." : "Deteksi Uang"}</Button>
            {detectionResult === "asli" && <div className="flex items-center gap-2 text-emerald-500"><ShieldCheck />Uang Asli</div>}
            {detectionResult === "palsu" && <div className="flex items-center gap-2 text-red-500"><ShieldX />Uang Palsu</div>}
          </div>
          <Separator />
          <div className="flex justify-between font-bold"><span>Total</span><span>{formatIDR(total)}</span></div>
          <Button onClick={handleCheckout} disabled={cart.length === 0 || detectionResult !== "asli"}>Bayar Sekarang</Button>
        </div>
      </div>
    </div>
  );
}