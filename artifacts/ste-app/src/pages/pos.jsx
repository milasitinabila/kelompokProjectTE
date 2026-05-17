import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useListProducts, getListProductsQueryKey,
  useListPosSessions, getListPosSessionsQueryKey,
  useOpenPosSession, useClosePosSession, useCreateTransaction,
} from "@workspace/api-client-react";
import { formatIDR } from "@/lib/format";
import { Search, ShoppingCart, Plus, Minus, Trash2, MonitorPlay, PowerOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Pos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

  const { data: products, isLoading: loadingProducts } = useListProducts(
    { search: search || undefined },
    { query: { queryKey: getListProductsQueryKey({ search: search || undefined }) } }
  );

  const { data: sessions } = useListPosSessions(
    { query: { queryKey: getListPosSessionsQueryKey() } }
  );

  // SAFE FALLBACK: Pastikan sessions selalu array
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const activeSession = safeSessions.find(s => s.status === 'open');
  
  const openSession = useOpenPosSession();
  const closeSession = useClosePosSession();
  const createTx = useCreateTransaction();

  const handleOpenSession = () => {
    openSession.mutate(
      { data: { cashierName: "Admin", openingCash: 500000 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPosSessionsQueryKey() });
          toast({ title: "Sesi Dibuka", description: "Kasir siap menerima transaksi." });
        }
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
        }
      }
    );
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i);
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, cartQuantity: Math.max(1, i.cartQuantity + delta) } : i));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.cartQuantity), 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax - discount;

  const handleCheckout = () => {
    if (!activeSession) return;
    if (cart.length === 0) {
      toast({ variant: "destructive", title: "Keranjang Kosong", description: "Tambahkan produk terlebih dahulu." });
      return;
    }
    const items = cart.map(i => ({ productId: i.id, quantity: i.cartQuantity, unitPrice: i.price }));
    createTx.mutate(
      { data: { sessionId: activeSession.id, items, discount: discount || undefined } },
      {
        onSuccess: (tx) => {
          toast({ title: "Transaksi Berhasil", description: `Invoice ${tx.invoiceNumber} dibuat.` });
          setCart([]);
          setDiscount(0);
          queryClient.invalidateQueries({ queryKey: getListPosSessionsQueryKey() });
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Transaksi gagal diproses." }),
      }
    );
  };

  // Pastikan products selalu array untuk map
  const safeProducts = Array.isArray(products) ? products : [];

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <PageHeader title="POS Kasir" description="Sistem Point of Sale." />
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <MonitorPlay className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Tidak Ada Sesi Aktif</h2>
          <p className="text-muted-foreground max-w-sm">Buka sesi kasir terlebih dahulu untuk mulai menerima transaksi.</p>
          <Button size="lg" onClick={handleOpenSession} disabled={openSession.isPending}>
            <MonitorPlay className="w-5 h-5 mr-2" />
            {openSession.isPending ? "Membuka..." : "Buka Sesi Kasir"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-6rem)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex gap-4 mb-4 items-center">
          <PageHeader title="POS Kasir" description="" />
          <div className="relative flex-1 max-w-md ml-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari produk atau layanan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">Kasir: Admin</Badge>
            <Button variant="destructive" size="icon" onClick={handleCloseSession} title="Tutup Sesi"><PowerOff className="w-4 h-4" /></Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <Card key={i} className="animate-pulse h-32" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
              {safeProducts.map(product => (
                <Card key={product.id} className="cursor-pointer hover:border-primary transition-all hover:-translate-y-1 overflow-hidden" onClick={() => addToCart(product)}>
                  <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground font-mono mb-1">{product.sku || 'N/A'}</div>
                    <h3 className="font-medium line-clamp-2 text-sm h-10">{product.name}</h3>
                    <div className="mt-3 flex justify-between items-end">
                      <span className="font-bold text-primary">{formatIDR(product.price)}</span>
                      <span className="text-[10px] text-muted-foreground">Stok: {product.stock}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="w-[380px] bg-card rounded-xl border flex flex-col flex-shrink-0">
        <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Keranjang</h2>
          <Badge className="ml-auto bg-primary">{cart.length}</Badge>
        </div>

        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Keranjang kosong</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/20">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm line-clamp-1 flex-1">{item.name}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-destructive hover:text-destructive/80 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="w-7 h-7" onClick={() => updateQty(item.id, -1)}><Minus className="w-3 h-3" /></Button>
                      <span className="w-8 text-center font-bold">{item.cartQuantity}</span>
                      <Button variant="outline" size="icon" className="w-7 h-7" onClick={() => updateQty(item.id, 1)}><Plus className="w-3 h-3" /></Button>
                    </div>
                    <span className="font-bold text-primary">{formatIDR(item.price * item.cartQuantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{formatIDR(subtotal)}</span></div>
          <div className="flex justify-between text-sm text-muted-foreground"><span>Pajak (11%)</span><span>{formatIDR(tax)}</span></div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground flex-1">Diskon (Rp)</span>
            <Input type="number" className="w-28 h-8 text-sm" value={discount || ""} onChange={(e) => setDiscount(Number(e.target.value) || 0)} placeholder="0" />
          </div>
          <Separator />
          <div className="flex justify-between items-center font-bold">
            <span className="text-lg">Total</span>
            <span className="text-xl text-primary">{formatIDR(total)}</span>
          </div>
          <Button className="w-full h-12 text-base font-bold" onClick={handleCheckout} disabled={createTx.isPending || cart.length === 0}>
            {createTx.isPending ? "Memproses..." : "Bayar Sekarang"}
          </Button>
        </div>
      </div>
    </div>
  );
}