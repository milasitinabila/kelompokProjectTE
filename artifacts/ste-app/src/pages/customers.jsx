import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useListCustomers, getListCustomersQueryKey, useCreateCustomer } from "@workspace/api-client-react";
import { Search, Plus, User, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createCustomer = useCreateCustomer();

  const { data: customers, isLoading } = useListCustomers(
    { search: search || undefined },
    { query: { queryKey: getListCustomersQueryKey({ search: search || undefined }) } }
  );

  // SAFE FALLBACK: Pastikan customers selalu array
  const safeCustomers = Array.isArray(customers) ? customers : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    createCustomer.mutate(
      { data: { name: form.name, phone: form.phone, email: form.email || undefined, address: form.address || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Pelanggan Ditambahkan", description: `${form.name} berhasil ditambahkan.` });
          queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
          setShowModal(false);
          setForm({ name: "", phone: "", email: "", address: "" });
        },
        onError: (error) => {
          console.error("Error detail:", error);
          toast({ variant: "destructive", title: "Gagal", description: "Pelanggan gagal ditambahkan." });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Data Pelanggan" description="Kelola direktori pelanggan dan informasi kontak.">
        <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4 mr-2" />Tambah Pelanggan</Button>
      </PageHeader>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari pelanggan..." className="pl-9 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Card key={i} className="animate-pulse h-32 bg-muted/20" />)}
        </div>
      ) : safeCustomers.length === 0 ? (
        <div className="p-16 text-center border border-dashed rounded-lg bg-card/50">
          <User className="w-12 h-12 mb-4 mx-auto opacity-20" />
          <p className="text-muted-foreground mb-4">Belum ada pelanggan ditemukan.</p>
          <Button variant="outline" onClick={() => setShowModal(true)}>Tambah pelanggan pertama</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {safeCustomers.map((customer) => (
            <Card key={customer.id} className="hover-elevate hover:border-primary/50 transition-colors cursor-pointer group">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-lg leading-tight mb-2">{customer.name}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 flex-shrink-0" /><span>{customer.phone}</span></div>
                  {customer.email && <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{customer.email}</span></div>}
                  {customer.address && <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{customer.address}</span></div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Tambah Pelanggan Baru</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap *</Label>
              <Input required placeholder="Nama pelanggan" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Nomor Telepon *</Label>
              <Input required type="tel" placeholder="08xx-xxxx-xxxx" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="email@contoh.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input placeholder="Alamat lengkap" value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
              <Button type="submit" disabled={createCustomer.isPending}>
                {createCustomer.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}