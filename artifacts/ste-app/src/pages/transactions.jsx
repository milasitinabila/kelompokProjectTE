import { useState } from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListTransactions, getListTransactionsQueryKey } from "@workspace/api-client-react";
import { formatIDR, formatDate } from "@/lib/format";
import { Receipt, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function Transactions() {
  const [status, setStatus] = useState("all");
  const { isAdmin } = useAuth();

  const { data: transactions, isLoading } = useListTransactions(
    { status: status !== "all" ? status : undefined },
    { query: { queryKey: getListTransactionsQueryKey({ status: status !== "all" ? status : undefined }) } }
  );

  // SAFE FALLBACK: Pastikan transactions selalu array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const getStatusBadge = (s) => {
    switch (s) {
      case 'paid': return <Badge className="bg-emerald-500/20 text-emerald-500">Lunas</Badge>;
      case 'pending': return <Badge className="bg-amber-500/20 text-amber-500">Menunggu</Badge>;
      case 'refunded': return <Badge className="bg-blue-500/20 text-blue-500">Dikembalikan</Badge>;
      case 'cancelled': return <Badge variant="destructive">Dibatalkan</Badge>;
      default: return <Badge variant="outline">{s}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Riwayat Transaksi" : "Transaksi Saya"}
        description={isAdmin ? "Semua riwayat penjualan POS dan pembayaran kontrak." : "Riwayat tagihan dan pembayaran Anda."}
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nomor invoice..." className="pl-9 bg-card" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="paid">Lunas</SelectItem>
            <SelectItem value="pending">Menunggu</SelectItem>
            <SelectItem value="refunded">Dikembalikan</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat transaksi...</div>
        ) : safeTransactions.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
            <Receipt className="w-12 h-12 mb-4 opacity-20" />
            <p>Belum ada transaksi.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">No. Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[130px] text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeTransactions.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-muted/50 cursor-pointer relative group">
                    <TableCell className="font-mono font-medium">
                      <Link href={`/transactions/${tx.id}`} className="absolute inset-0 z-10" />
                      {tx.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(tx.createdAt)}</TableCell>
                    <TableCell>{tx.customerName || <span className="text-muted-foreground italic">Pelanggan Umum</span>}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{formatIDR(tx.total)}</TableCell>
                    <TableCell className="text-center">{getStatusBadge(tx.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}