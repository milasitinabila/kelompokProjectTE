import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListProducts, getListProductsQueryKey, useCreateProduct, useUpdateProduct } from "@workspace/api-client-react";
import { formatIDR } from "@/lib/format";
import { Search, Plus, AlertCircle, Package, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const EMPTY_FORM = { name: "", sku: "", category: "sparepart", price: "", stock: "", unit: "pcs", minStock: "5" };

const categoryLabel = (cat) => {
  const map = { sparepart: "Sparepart", consumable: "Bahan Habis Pakai", service: "Jasa", product: "Produk", other: "Lainnya" };
  return map[cat] ?? cat;
};

export default function Products() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const { data: products, isLoading } = useListProducts(
    { search: search || undefined },
    { query: { queryKey: getListProductsQueryKey({ search: search || undefined }) } }
  );

  // SAFE FALLBACK: Pastikan products selalu array
  const safeProducts = Array.isArray(products) ? products : [];

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "sparepart",
      price: String(product.price || ""),
      stock: String(product.stock || ""),
      unit: product.unit || "pcs",
      minStock: String(product.minStock || "5"),
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      sku: form.sku || undefined,
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      unit: form.unit || undefined,
      minStock: Number(form.minStock) || undefined,
    };

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data },
        {
          onSuccess: () => {
            toast({ title: "Produk Diperbarui", description: `${form.name} berhasil diperbarui.` });
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            setShowModal(false);
          },
          onError: () => toast({ variant: "destructive", title: "Gagal", description: "Produk gagal diperbarui." }),
        }
      );
    } else {
      createProduct.mutate(
        { data },
        {
          onSuccess: () => {
            toast({ title: "Produk Ditambahkan", description: `${form.name} berhasil ditambahkan.` });
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            setShowModal(false);
            setForm(EMPTY_FORM);
          },
          onError: () => toast({ variant: "destructive", title: "Gagal", description: "Produk gagal ditambahkan." }),
        }
      );
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="space-y-6">
      <PageHeader title="Inventaris" description="Kelola stok sparepart, layanan, dan bahan habis pakai.">
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Tambah Item</Button>
      </PageHeader>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari nama atau SKU..." className="pl-9 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat inventaris...</div>
        ) : safeProducts.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
            <Package className="w-12 h-12 mb-4 opacity-20" />
            <p>Belum ada produk ditemukan.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-center">Stok</TableHead>
                <TableHead className="w-[80px] text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeProducts.map((product) => {
                const isLowStock = product.stock <= (product.minStock || 5);
                return (
                  <TableRow key={product.id} className="group">
                    <TableCell className="font-mono text-xs text-muted-foreground">{product.sku || '-'}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{categoryLabel(product.category)}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">{formatIDR(product.price)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-bold ${isLowStock ? 'text-destructive' : ''}`}>{product.stock}</span>
                        {product.unit && <span className="text-xs text-muted-foreground">{product.unit}</span>}
                        {isLowStock && <AlertCircle className="w-4 h-4 text-destructive" aria-label="Stok Rendah" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEdit(product)}
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Item Inventaris" : "Tambah Item Inventaris"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nama Item *</Label>
                <Input required placeholder="Nama produk atau layanan" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input placeholder="Kode unik" value={form.sku} onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sparepart">Sparepart</SelectItem>
                    <SelectItem value="consumable">Bahan Habis Pakai</SelectItem>
                    <SelectItem value="service">Jasa</SelectItem>
                    <SelectItem value="product">Produk</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Harga (Rp) *</Label>
                <Input type="number" required min={0} placeholder="0" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Stok *</Label>
                <Input type="number" required min={0} placeholder="0" value={form.stock} onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Satuan</Label>
                <Input placeholder="pcs, unit, liter..." value={form.unit} onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Stok Minimum</Label>
                <Input type="number" min={0} placeholder="5" value={form.minStock} onChange={(e) => setForm(f => ({ ...f, minStock: e.target.value }))} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : editingProduct ? "Simpan Perubahan" : "Tambah Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}