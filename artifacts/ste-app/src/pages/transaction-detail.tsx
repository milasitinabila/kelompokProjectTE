import { useState } from "react";
import { useRoute, Link } from "wouter";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  useGetTransaction,
  getGetTransactionQueryKey,
  usePayTransaction,
  PayTransactionBodyPaymentsItemMethod
} from "@workspace/api-client-react";
import { formatIDR, formatDate, translatePaymentMethod } from "@/lib/format";
import { ArrowLeft, Printer, CreditCard } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function TransactionDetail() {
  const [, params] = useRoute("/transactions/:id");
  const id = Number(params?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [payMethod, setPayMethod] = useState<string>("qris");

  const { data: tx, isLoading } = useGetTransaction(id, {
    query: { enabled: !!id, queryKey: getGetTransactionQueryKey(id) }
  });

  const payTx = usePayTransaction();

  const handlePay = () => {
    if (!tx) return;
    payTx.mutate(
      {
        id,
        data: {
          payments: [{ method: payMethod as PayTransactionBodyPaymentsItemMethod, amount: tx.total }]
        }
      },
      {
        onSuccess: (data) => {
          toast({ title: "Pembayaran Berhasil", description: "Transaksi telah lunas." });
          queryClient.setQueryData(getGetTransactionQueryKey(id), data);
        },
        onError: () => {
          toast({ variant: "destructive", title: "Gagal", description: "Pembayaran gagal diproses." });
        }
      }
    );
  };

  if (isLoading) return <div className="p-8 text-center">Memuat...</div>;
  if (!tx) return <div className="p-8 text-center text-destructive">Transaksi tidak ditemukan</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/transactions">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <PageHeader title={`Invoice ${tx.invoiceNumber}`} description={formatDate(tx.createdAt)} />
        <div className="ml-auto">
          <Button variant="outline" className="mr-2">
            <Printer className="w-4 h-4 mr-2" /> Cetak
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle>Daftar Item</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/10 text-muted-foreground">
                    <th className="text-left font-medium p-4">Item</th>
                    <th className="text-center font-medium p-4 w-20">Qty</th>
                    <th className="text-right font-medium p-4 w-32">Harga</th>
                    <th className="text-right font-medium p-4 w-32">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {tx.items?.map((item: any) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="p-4 font-medium">{item.productName}</td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right text-muted-foreground">{formatIDR(item.unitPrice)}</td>
                      <td className="p-4 text-right font-bold text-primary">{formatIDR(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
            <div className="bg-muted/10 p-6 border-t space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatIDR(tx.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Pajak (11%)</span>
                <span>{formatIDR(tx.tax)}</span>
              </div>
              {tx.discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Diskon</span>
                  <span>-{formatIDR(tx.discount)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-black text-primary">{formatIDR(tx.total)}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                {tx.status === 'paid' ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
                      <CreditCard className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-500">LUNAS</h3>
                    {tx.payments && tx.payments.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        via {translatePaymentMethod(tx.payments[0]?.method)}
                      </p>
                    )}
                  </>
                ) : tx.status === 'pending' ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                      <CreditCard className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-amber-500 mb-4">MENUNGGU</h3>
                    {isAdmin && (
                      <div className="w-full space-y-3">
                        <Select value={payMethod} onValueChange={setPayMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tunai">Tunai</SelectItem>
                            <SelectItem value="qris">QRIS</SelectItem>
                            <SelectItem value="transfer">Transfer Bank</SelectItem>
                            <SelectItem value="kartu">Kartu</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button className="w-full h-12" onClick={handlePay} disabled={payTx.isPending}>
                          {payTx.isPending ? "Memproses..." : "Tandai Lunas"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <Badge variant="destructive" className="text-lg py-1 px-4">{tx.status.toUpperCase()}</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Pelanggan</p>
                <p className="font-medium">{tx.customerName || 'Pelanggan Umum'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">ID Sesi</p>
                <p className="font-mono">{tx.sessionId || '-'}</p>
              </div>
              {tx.notes && (
                <div>
                  <p className="text-muted-foreground mb-1">Catatan</p>
                  <p className="bg-muted p-2 rounded border">{tx.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
