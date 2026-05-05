import { useState, useRef } from "react";
import { useRoute, Link } from "wouter";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGetTransaction, getGetTransactionQueryKey, usePayTransaction } from "@workspace/api-client-react";
import { formatIDR, formatDate, formatShortDate, translatePaymentMethod } from "@/lib/format";
import { ArrowLeft, Printer, CreditCard } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export default function TransactionDetail() {
  const [, params] = useRoute("/transactions/:id");
  const id = Number(params?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [payMethod, setPayMethod] = useState("qris");
  const printRef = useRef(null);

  const { data: tx, isLoading } = useGetTransaction(id, {
    query: { enabled: !!id, queryKey: getGetTransactionQueryKey(id) }
  });

  const payTx = usePayTransaction();

  const handlePay = () => {
    if (!tx) return;
    payTx.mutate(
      { id, data: { payments: [{ method: payMethod, amount: tx.total }] } },
      {
        onSuccess: (data) => {
          toast({ title: "Pembayaran Berhasil", description: "Transaksi telah lunas." });
          queryClient.setQueryData(getGetTransactionQueryKey(id), data);
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Pembayaran gagal diproses." }),
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-8 text-center">Memuat...</div>;
  if (!tx) return <div className="p-8 text-center text-destructive">Transaksi tidak ditemukan</div>;

  return (
    <>
      {/* Print Style - hides everything except invoice */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-invoice, #print-invoice * { visibility: visible !important; }
          #print-invoice { position: fixed; top: 0; left: 0; width: 100%; background: white; color: black; padding: 32px; z-index: 9999; }
          #print-invoice .no-print { display: none !important; }
        }
      `}</style>

      {/* Printable Invoice */}
      <div id="print-invoice" ref={printRef} className="hidden">
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #1d4ed8' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1d4ed8', margin: 0 }}>Karya Mandiri</h1>
              <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Sistem Transaksi Elektronik</p>
              <p style={{ color: '#6b7280', margin: '2px 0 0', fontSize: '13px' }}>Jl. Teknologi No. 123, Bandung, Indonesia</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>INVOICE</h2>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', margin: '4px 0 0', color: '#374151' }}>{tx.invoiceNumber}</p>
              <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '13px' }}>{formatDate(tx.createdAt)}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <p style={{ fontWeight: 'bold', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Ditagihkan Kepada</p>
              <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 2px' }}>{tx.customerName || 'Pelanggan Umum'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: 'bold', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Status</p>
              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', fontWeight: 'bold', fontSize: '14px', backgroundColor: tx.status === 'paid' ? '#d1fae5' : '#fef3c7', color: tx.status === 'paid' ? '#065f46' : '#92400e' }}>
                {tx.status === 'paid' ? 'LUNAS' : tx.status === 'pending' ? 'MENUNGGU' : tx.status.toUpperCase()}
              </span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr style={{ backgroundColor: '#eff6ff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '13px', color: '#374151', borderBottom: '1px solid #bfdbfe' }}>Item</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', fontSize: '13px', color: '#374151', borderBottom: '1px solid #bfdbfe', width: '60px' }}>Qty</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '13px', color: '#374151', borderBottom: '1px solid #bfdbfe', width: '130px' }}>Harga</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '13px', color: '#374151', borderBottom: '1px solid #bfdbfe', width: '130px' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {tx.items?.map((item, i) => (
                <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={{ padding: '10px 12px', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>{item.productName}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>{item.quantity}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: '14px', color: '#6b7280', borderBottom: '1px solid #e5e7eb' }}>{formatIDR(item.unitPrice)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px', color: '#1d4ed8', borderBottom: '1px solid #e5e7eb' }}>{formatIDR(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
            <div style={{ width: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#6b7280', fontSize: '14px' }}><span>Subtotal</span><span>{formatIDR(tx.subtotal)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#6b7280', fontSize: '14px' }}><span>Pajak (11%)</span><span>{formatIDR(tx.tax)}</span></div>
              {tx.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#dc2626', fontSize: '14px' }}><span>Diskon</span><span>-{formatIDR(tx.discount)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #1d4ed8', marginTop: '6px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Total</span>
                <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#1d4ed8' }}>{formatIDR(tx.total)}</span>
              </div>
            </div>
          </div>

          {tx.payments && tx.payments.length > 0 && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px' }}>
              <p style={{ fontWeight: 'bold', color: '#065f46', margin: '0 0 4px', fontSize: '14px' }}>Pembayaran Diterima</p>
              {tx.payments.map((p, i) => (
                <p key={i} style={{ color: '#047857', margin: 0, fontSize: '14px' }}>{translatePaymentMethod(p.method)} — {formatIDR(p.amount)}</p>
              ))}
            </div>
          )}

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
            <p style={{ margin: '0 0 4px' }}>Terima kasih atas kepercayaan Anda kepada Karya Mandiri.</p>
            <p style={{ margin: 0 }}>Dokumen ini dicetak pada {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
          </div>
        </div>
      </div>

      {/* Normal Screen View */}
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/transactions">
            <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <PageHeader title={`Invoice ${tx.invoiceNumber}`} description={formatDate(tx.createdAt)} />
          <div className="ml-auto">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" /> Cetak Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 border-b"><CardTitle>Daftar Item</CardTitle></CardHeader>
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
                    {tx.items?.map((item) => (
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
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatIDR(tx.subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Pajak (11%)</span><span>{formatIDR(tx.tax)}</span></div>
                {tx.discount > 0 && <div className="flex justify-between text-destructive"><span>Diskon</span><span>-{formatIDR(tx.discount)}</span></div>}
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
              <CardHeader><CardTitle>Status Pembayaran</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4">
                  {tx.status === 'paid' ? (
                    <>
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
                        <CreditCard className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-emerald-500">LUNAS</h3>
                      {tx.payments?.[0] && <p className="text-xs text-muted-foreground mt-2">via {translatePaymentMethod(tx.payments[0].method)}</p>}
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
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
              <CardHeader><CardTitle>Detail</CardTitle></CardHeader>
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
    </>
  );
}
