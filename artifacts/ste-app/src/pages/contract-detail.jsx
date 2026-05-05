import { useRoute } from "wouter";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGetContract, getGetContractQueryKey, useSignContract } from "@workspace/api-client-react";
import { formatIDR, formatShortDate, translateServiceType, translatePaymentMethod } from "@/lib/format";
import { useState } from "react";
import { PenTool, CheckCircle, FileText, Printer } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ContractDetail() {
  const [, params] = useRoute("/contracts/:id");
  const id = Number(params?.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contract, isLoading } = useGetContract(id, {
    query: { enabled: !!id, queryKey: getGetContractQueryKey(id) }
  });

  const signContract = useSignContract();
  const [providerSigner, setProviderSigner] = useState("");
  const [customerSigner, setCustomerSigner] = useState("");

  const handleSign = (role) => {
    const signerName = role === 'provider' ? providerSigner : customerSigner;
    if (!signerName.trim()) {
      toast({ variant: "destructive", title: "Nama diperlukan", description: "Masukkan nama untuk menandatangani." });
      return;
    }
    signContract.mutate(
      { id, data: { signerRole: role, signerName, signatureData: "signature_hash_placeholder" } },
      {
        onSuccess: (data) => {
          toast({ title: "Kontrak Ditandatangani", description: `Berhasil ditandatangani sebagai ${role}.` });
          queryClient.setQueryData(getGetContractQueryKey(id), data);
        },
        onError: () => toast({ variant: "destructive", title: "Gagal", description: "Gagal menandatangani kontrak." }),
      }
    );
  };

  if (isLoading) return <div className="p-8 text-center">Memuat kontrak...</div>;
  if (!contract) return <div className="p-8 text-center text-destructive">Kontrak tidak ditemukan</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader title={`Kontrak ${contract.contractNumber}`} description="Tinjau klausul dan kelola tanda tangan">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" />Cetak / PDF
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card shadow-lg border-muted/40">
            <CardHeader className="border-b bg-muted/20 pb-8 pt-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-serif font-bold text-primary mb-2">Karya Mandiri</h1>
                  <p className="text-sm text-muted-foreground">Sistem Transaksi Elektronik</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold uppercase tracking-widest text-muted-foreground/50">Surat Perjanjian</h2>
                  <p className="font-mono mt-2">{contract.contractNumber}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 text-sm leading-relaxed">
              <div className="text-center">
                <h3 className="text-lg font-bold uppercase underline underline-offset-4">{contract.title}</h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="font-bold text-muted-foreground uppercase text-xs mb-2">Pihak Pertama (Penyedia)</p>
                  <p className="font-bold text-base">Karya Mandiri</p>
                  <p>Jl. Teknologi No. 123</p>
                  <p>Bandung, Indonesia</p>
                </div>
                <div>
                  <p className="font-bold text-muted-foreground uppercase text-xs mb-2">Pihak Kedua (Pelanggan)</p>
                  <p className="font-bold text-base">{contract.customerName}</p>
                  <p>ID Pelanggan: CUST-{contract.customerId}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-bold text-base uppercase tracking-wider text-primary">Pasal 1: Ruang Lingkup Pekerjaan</h4>
                <p className="whitespace-pre-wrap pl-4 border-l-2 border-primary/20 text-muted-foreground">
                  {contract.description || "Tidak ada deskripsi detail."}
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-base uppercase tracking-wider text-primary">Pasal 2: Ketentuan Layanan</h4>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li><strong>Jenis Layanan:</strong> {translateServiceType(contract.serviceType)}</li>
                  <li><strong>Tanggal Mulai:</strong> {contract.startDate ? formatShortDate(contract.startDate) : '-'}</li>
                  <li><strong>Estimasi Selesai:</strong> {contract.estimatedEndDate ? formatShortDate(contract.estimatedEndDate) : '-'}</li>
                  <li><strong>Masa Garansi:</strong> {contract.warrantyPeriod ? `${contract.warrantyPeriod} Hari` : 'Tidak ada garansi'}</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-base uppercase tracking-wider text-primary">Pasal 3: Nilai Kontrak & Pembayaran</h4>
                <div className="bg-muted/20 p-4 rounded border">
                  <div className="flex justify-between font-bold text-lg mb-2">
                    <span>Total Nilai</span>
                    <span className="text-primary">{contract.totalValue ? formatIDR(contract.totalValue) : '-'}</span>
                  </div>
                  <p className="text-muted-foreground">
                    Metode Pembayaran: <strong>{contract.paymentMethod ? translatePaymentMethod(contract.paymentMethod) : '-'}</strong>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Status Kontrak</CardTitle></CardHeader>
            <CardContent>
              <Badge className="text-sm px-3 py-1 mb-4" variant={contract.status === 'active' ? 'default' : contract.status === 'completed' ? 'secondary' : 'outline'}>
                {contract.status.toUpperCase()}
              </Badge>
              <div className="text-sm space-y-2 text-muted-foreground">
                <div className="flex justify-between"><span>Dibuat:</span><span>{formatShortDate(contract.createdAt)}</span></div>
                <div className="flex justify-between"><span>Provider TTD:</span><span>{contract.signedByProvider ? <CheckCircle className="w-4 h-4 text-emerald-500 inline" /> : 'Belum'}</span></div>
                <div className="flex justify-between"><span>Customer TTD:</span><span>{contract.signedByCustomer ? <CheckCircle className="w-4 h-4 text-emerald-500 inline" /> : 'Belum'}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card className={contract.signedByProvider ? "bg-muted/20 opacity-70" : "border-primary/50"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center"><PenTool className="w-4 h-4 mr-2" />TTD Penyedia</CardTitle>
            </CardHeader>
            <CardContent>
              {contract.signedByProvider ? (
                <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" /> Ditandatangani pada {contract.providerSignedAt ? formatShortDate(contract.providerSignedAt) : ''}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="provider-name">Nama Petugas</Label>
                    <Input id="provider-name" value={providerSigner} onChange={(e) => setProviderSigner(e.target.value)} placeholder="Nama lengkap..." className="mt-1" />
                  </div>
                  <Button className="w-full" onClick={() => handleSign('provider')}>Tanda Tangani Kontrak</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={contract.signedByCustomer ? "bg-muted/20 opacity-70" : "border-accent/50"}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center"><FileText className="w-4 h-4 mr-2" />TTD Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              {contract.signedByCustomer ? (
                <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" /> Ditandatangani pada {contract.customerSignedAt ? formatShortDate(contract.customerSignedAt) : ''}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="customer-name">Nama Pelanggan</Label>
                    <Input id="customer-name" value={customerSigner} onChange={(e) => setCustomerSigner(e.target.value)} placeholder="Ketik persetujuan..." className="mt-1" />
                  </div>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleSign('customer')}>Tanda Tangani (Pelanggan)</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
