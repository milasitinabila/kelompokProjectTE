import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  useListProducts, 
  getListProductsQueryKey,
  useListPosSessions,
  getListPosSessionsQueryKey,
  useOpenPosSession,
  useClosePosSession,
  useCreateTransaction,
  Product,
  CreateTransactionBodyItemsItem
} from "@workspace/api-client-react";
import { formatIDR } from "@/lib/format";
import { Search, ShoppingCart, Plus, Minus, Trash2, MonitorPlay, PowerOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface CartItem extends Product {
  cartQuantity: number;
}

export default function Pos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  
  const { data: products, isLoading: loadingProducts } = useListProducts(
    { search: search || undefined },
    { query: { queryKey: getListProductsQueryKey({ search: search || undefined }) } }
  );

  const { data: sessions } = useListPosSessions(
    {}, 
    { query: { queryKey: getListPosSessionsQueryKey() } }
  );
  
  const activeSession = sessions?.find(s => s.status === 'open');

  const openSession = useOpenPosSession();
  const closeSession = useClosePosSession();
  const createTx = useCreateTransaction();

  const handleOpenSession = () => {
    openSession.mutate(
      { data: { cashierName: "Admin", openingCash: 500000 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPosSessionsQueryKey() });
          toast({ title: "Session Opened", description: "Kasir siap menerima transaksi." });
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
          toast({ title: "Session Closed", description: "Rekap transaksi telah dicatat." });
        }
      }
    );
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        return prev.map(i => i.id === product.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.cartQuantity + delta;
        return newQ > 0 ? { ...item, cartQuantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const tax = subtotal * 0.11; // 11% PPN
  const total = subtotal + tax - discount;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!activeSession) {
      toast({ variant: "destructive", title: "Sesi Kasir Tutup", description: "Buka sesi kasir terlebih dahulu." });
      return;
    }

    const items: CreateTransactionBodyItemsItem[] = cart.map(item => ({
      productId: item.id,
      quantity: item.cartQuantity,
      unitPrice: item.price
    }));

    createTx.mutate(
      { 
        data: {
          sessionId: activeSession.id,
          items,
          discount,
          tax
        }
      },
      {
        onSuccess: () => {
          setCart([]);
          setDiscount(0);
          toast({ title: "Transaksi Berhasil", description: "Menunggu pembayaran." });
          // In a real app, this would open a payment modal or redirect to detail page
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Gagal membuat transaksi." });
        }
      }
    );
  };

  if (!activeSession) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <MonitorPlay className="w-24 h-24 text-muted" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">POS Offline</h2>
          <p className="text-muted-foreground mt-2">Buka sesi kasir untuk mulai menerima transaksi.</p>
        </div>
        <Button size="lg" onClick={handleOpenSession} disabled={openSession.isPending}>
          {openSession.isPending ? "Membuka..." : "Buka Sesi Kasir"}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Product Selection */}
      <div className="flex-1 flex flex-col min-w-0 bg-card rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari produk atau layanan..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
              Kasir Aktif: Admin
            </Badge>
            <Button variant="destructive" size="icon" onClick={handleCloseSession} title="Tutup Sesi">
              <PowerOff className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {loadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Card key={i} className="animate-pulse h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products?.map(product => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:border-primary transition-all hover-elevate hover:-translate-y-1 overflow-hidden"
                  onClick={() => addToCart(product)}
                >
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

      {/* Cart Sidebar */}
      <div className="w-[380px] bg-card rounded-xl border flex flex-col flex-shrink-0">
        <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Keranjang</h2>
          <Badge className="ml-auto bg-primary">{cart.length}</Badge>
        </div>

        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20">
              <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
              <p>Belum ada barang di keranjang</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex flex-col gap-2 p-3 bg-muted/20 rounded-lg border border-border/50">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm leading-tight pr-4">{item.name}</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-bold text-primary">{formatIDR(item.price)}</span>
                    <div className="flex items-center gap-2 bg-background border rounded-md p-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-muted rounded">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm w-6 text-center font-medium">{item.cartQuantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-muted rounded">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t bg-muted/10 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">PPN (11%)</span>
            <span>{formatIDR(tax)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-destructive">
              <span>Diskon</span>
              <span>-{formatIDR(discount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between items-end">
            <span className="font-semibold text-lg">Total</span>
            <span className="font-bold text-2xl text-primary">{formatIDR(total)}</span>
          </div>
          
          <Button 
            className="w-full mt-4 h-12 text-lg font-bold" 
            disabled={cart.length === 0 || createTx.isPending}
            onClick={handleCheckout}
          >
            {createTx.isPending ? "Memproses..." : "PROSES PEMBAYARAN"}
          </Button>
        </div>
      </div>
    </div>
  );
}
