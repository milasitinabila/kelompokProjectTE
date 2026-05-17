import { useState } from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListContracts, getListContractsQueryKey } from "@workspace/api-client-react";
import { formatIDR, formatShortDate, translateServiceType } from "@/lib/format";
import { Plus, Search, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

export default function Contracts() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { isAdmin } = useAuth();

  const { data: contracts, isLoading } = useListContracts(
    { status: statusFilter !== "all" ? statusFilter : undefined },
    { query: { queryKey: getListContractsQueryKey({ status: statusFilter !== "all" ? statusFilter : undefined }) } }
  );

  // SAFE FALLBACK: Pastikan contracts selalu array
  const safeContracts = Array.isArray(contracts) ? contracts : [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-primary/20 text-primary hover:bg-primary/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30';
      case 'cancelled': return 'bg-destructive/20 text-destructive hover:bg-destructive/30';
      default: return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  const translateStatus = (status) => {
    const map = { draft: 'Draft', active: 'Aktif', completed: 'Selesai', cancelled: 'Dibatalkan' };
    return map[status] || status;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Manajemen Kontrak" : "Kontrak Saya"}
        description={isAdmin ? "Kelola perjanjian layanan, pemasangan, dan garansi." : "Lihat detail kontrak servis Anda."}
      >
        {isAdmin && (
          <Link href="/contracts/new" className="outline-none block">
            <Button><Plus className="w-4 h-4 mr-2" />Kontrak Baru</Button>
          </Link>
        )}
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Cari kontrak..." className="pl-9 bg-card" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px] bg-card">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <Card key={i} className="animate-pulse"><CardContent className="p-6 h-48 bg-muted/20" /></Card>)}
        </div>
      ) : safeContracts.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-lg bg-card/50">
          <p className="text-muted-foreground mb-4">Belum ada kontrak ditemukan.</p>
          {isAdmin && <Link href="/contracts/new"><Button variant="outline">Buat kontrak pertama</Button></Link>}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {safeContracts.map((contract) => (
            <Link key={contract.id} href={`/contracts/${contract.id}`} className="block outline-none hover-elevate rounded-lg">
              <Card className="h-full transition-colors hover:border-primary/50 cursor-pointer">
                <CardContent className="p-5 flex flex-col h-full justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-mono text-muted-foreground mb-1">{contract.contractNumber}</div>
                        <h3 className="font-semibold text-lg line-clamp-1">{contract.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{contract.customerName}</p>
                      </div>
                      <Badge className={getStatusColor(contract.status)} variant="outline">{translateStatus(contract.status)}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary">{translateServiceType(contract.serviceType)}</Badge>
                      {contract.startDate && <span className="text-muted-foreground flex items-center bg-muted/50 px-2 py-0.5 rounded">{formatShortDate(contract.startDate)}</span>}
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t flex justify-between items-center">
                    <div className="text-sm font-medium">{contract.totalValue ? formatIDR(contract.totalValue) : '-'}</div>
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] text-muted-foreground mr-1">TTD:</span>
                      <div className={`w-2 h-2 rounded-full ${contract.signedByProvider ? 'bg-primary' : 'bg-muted'}`} />
                      <div className={`w-2 h-2 rounded-full ${contract.signedByCustomer ? 'bg-primary' : 'bg-muted'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}