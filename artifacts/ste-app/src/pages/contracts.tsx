import { useState } from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useListContracts, 
  getListContractsQueryKey,
  ListContractsStatus
} from "@workspace/api-client-react";
import { formatIDR, formatShortDate, translateServiceType } from "@/lib/format";
import { Plus, Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Contracts() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: contracts, isLoading } = useListContracts(
    { status: statusFilter !== "all" ? statusFilter as ListContractsStatus : undefined },
    { query: { queryKey: getListContractsQueryKey({ status: statusFilter !== "all" ? statusFilter as ListContractsStatus : undefined }) } }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary/20 text-primary hover:bg-primary/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30';
      case 'cancelled': return 'bg-destructive/20 text-destructive hover:bg-destructive/30';
      default: return 'bg-muted text-muted-foreground hover:bg-muted/80';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Contracts" 
        description="Manage service agreements, installations, and warranties."
      >
        <Link href="/contracts/new" className="outline-none block">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </Link>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search contracts..." 
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px] bg-card">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-48 bg-muted/20" />
            </Card>
          ))}
        </div>
      ) : contracts?.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-lg bg-card/50">
          <p className="text-muted-foreground mb-4">No contracts found.</p>
          <Link href="/contracts/new">
            <Button variant="outline">Create your first contract</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {contracts?.map((contract) => (
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
                      <Badge className={getStatusColor(contract.status)} variant="outline">
                        {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary">{translateServiceType(contract.serviceType)}</Badge>
                      {contract.startDate && (
                        <span className="text-muted-foreground flex items-center bg-muted/50 px-2 py-0.5 rounded">
                          {formatShortDate(contract.startDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t flex justify-between items-center">
                    <div className="text-sm font-medium">
                      {contract.totalValue ? formatIDR(contract.totalValue) : '-'}
                    </div>
                    <div className="flex gap-2">
                      <div className={`w-2 h-2 rounded-full ${contract.signedByProvider ? 'bg-primary' : 'bg-muted'}`} title="Provider signed" />
                      <div className={`w-2 h-2 rounded-full ${contract.signedByCustomer ? 'bg-primary' : 'bg-muted'}`} title="Customer signed" />
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
