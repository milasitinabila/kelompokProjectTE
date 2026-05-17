import { useLocation } from "wouter";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateContract, useListCustomers, getListCustomersQueryKey } from "@workspace/api-client-react";

const formSchema = z.object({
  customerId: z.coerce.number().min(1, "Pelanggan harus dipilih"),
  serviceType: z.enum(["hitachi", "electrolux"]),
  title: z.string().min(5, "Judul minimal 5 karakter"),
  description: z.string().optional(),
  totalValue: z.coerce.number().min(0, "Nilai tidak boleh negatif"),
  paymentMethod: z.string().optional(),
  startDate: z.string().min(1, "Tanggal mulai harus diisi"),
  estimatedEndDate: z.string().optional(),
  warrantyPeriod: z.coerce.number().optional(),
});

export default function ContractNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: customers, isLoading: loadingCustomers } = useListCustomers({}, { query: { queryKey: getListCustomersQueryKey() } });
  const createContract = useCreateContract();

  // SAFE FALLBACK: Pastikan customers selalu array
  const safeCustomers = Array.isArray(customers) ? customers : [];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: 0,
      serviceType: "hitachi",
      title: "",
      description: "",
      totalValue: 0,
      paymentMethod: "transfer",
      startDate: new Date().toISOString().split('T')[0],
      estimatedEndDate: "",
      warrantyPeriod: 30,
    },
  });

  function onSubmit(values) {
    createContract.mutate({ data: values }, {
      onSuccess: (contract) => {
        toast({ title: "Kontrak Dibuat", description: `Kontrak ${contract.contractNumber} berhasil dibuat.` });
        setLocation(`/contracts/${contract.id}`);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Gagal", description: "Kontrak gagal dibuat. Silakan coba lagi." });
      }
    });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Kontrak Baru" description="Buat perjanjian layanan atau kontrak transaksi baru." />
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="customerId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pelanggan</FormLabel>
                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? field.value.toString() : ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingCustomers ? "Memuat..." : "Pilih pelanggan"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingCustomers ? (
                          <SelectItem value="loading" disabled>Memuat pelanggan...</SelectItem>
                        ) : safeCustomers.length > 0 ? (
                          safeCustomers.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>Belum ada pelanggan</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="serviceType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Layanan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis layanan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hitachi">Hitachi</SelectItem>
                        <SelectItem value="electrolux">Electrolux</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Kontrak</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Servis AC Hitachi 1.5 PK" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ruang Lingkup Pekerjaan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deskripsi detail pekerjaan yang akan dilakukan..." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="totalValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Nilai (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metode Pembayaran</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tunai">Tunai</SelectItem>
                        <SelectItem value="qris">QRIS</SelectItem>
                        <SelectItem value="transfer">Transfer Bank</SelectItem>
                        <SelectItem value="kartu">Kartu</SelectItem>
                        <SelectItem value="cicilan">Cicilan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="estimatedEndDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimasi Selesai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="warrantyPeriod" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Garansi (Hari)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setLocation("/contracts")}>
                  Batal
                </Button>
                <Button type="submit" disabled={createContract.isPending}>
                  {createContract.isPending ? "Menyimpan..." : "Buat Draft Kontrak"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}