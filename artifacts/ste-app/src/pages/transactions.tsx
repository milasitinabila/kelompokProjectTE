import { useState } from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useListTransactions, 
  getListTransactionsQueryKey,
  ListTransactionsStatus
} from "@workspace/api-client-react";
import { formatIDR, formatDate } from "@/lib/format";
import { Receipt, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Transactions() {
  const [status, setStatus] = useState<string>("all");
  
  const { data: transactions, isLoading } = useListTransactions(
    { status: status !== "all" ? status as ListTransactionsStatus : undefined },
    { query: { queryKey: getListTransactionsQueryKey({ status: status !== "all" ? status as ListTransactionsStatus : undefined }) } }
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">Paid</Badge>;
      case 'pending': return <Badge className="bg-amber-500/20 text-amber-500 hover:bg-amber-500/30">Pending</Badge>;
      case 'refunded': return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30">Refunded</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Transactions" 
        description="History of all POS sales and contract payments."
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search invoice..." className="pl-9 bg-card" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
        ) : transactions?.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
            <Receipt className="w-12 h-12 mb-4 opacity-20" />
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[120px] text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-muted/50 cursor-pointer relative group">
                    <TableCell className="font-mono font-medium">
                      <Link href={`/transactions/${tx.id}`} className="absolute inset-0 z-10" />
                      {tx.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                    <TableCell>
                      {tx.customerName || <span className="text-muted-foreground italic">Walk-in Customer</span>}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {formatIDR(tx.total)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(tx.status)}
                    </TableCell>
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
