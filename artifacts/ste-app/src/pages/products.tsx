import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useListProducts,
  getListProductsQueryKey,
  useCreateProduct,
} from "@workspace/api-client-react";
import { formatIDR } from "@/lib/format";
import { Search, Plus, AlertCircle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Products() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "", sku: "", category: "sparepart", price: "", stock: "", unit: "pcs", minStock: "5"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createProduct = useCreateProduct();

  const { data: products, isLoading } = useListProducts(
    { search: search || undefined },
    { query: { queryKey: getListProductsQueryKey({ search: search || undefined }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate(
      {
        data: {
          name: form.name,
          sku: form.sku || undefined,
          category: form.category as any,
          price: Number(form.price),
          stock: Number(form.stock),
          unit: form.unit || undefined,
          minStock: Number(form.minStock) || undefined,
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Produk Ditambahkan", description: `${form.name} berhasil ditambahkan.` });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setShowModal(false);
          setForm({ name: "", sku: "", category: "sparepart", price: "", stock: "", unit: "pcs", minStock: "5" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Gagal", description: "Produk gagal ditambahkan." });
        }
      }
    );
  };

  const categoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      sparepart: "Sparepart",
      consumable: "Bahan Habis Pakai",
      service: "Jasa",
      product: "Produk",
      other: "Lainnya",
    };
    return map[cat] ?? cat;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaris"
        description="Kelola stok sparepart, layanan, dan bahan habis pakai."
      >
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Item
        </Button>
      </PageHeader>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau SKU..."
          className="pl-9 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Memuat inventaris...</div>
        ) : products?.length === 0 ? (
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
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => {
                const isLowStock = product.stock <= (product.minStock || 5);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {product.sku || '-'}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {categoryLabel(product.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatIDR(product.price)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-bold ${isLowStock ? 'text-destructive' : ''}`}>
                          {product.stock}
                        </span>
                        {product.unit && <span className="text-xs text-muted-foreground">{product.unit}</span>}
                        {isLowStock && <AlertCircle className="w-4 h-4 text-destructive" aria-label="Stok Rendah" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Edit</Button>
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
            <DialogTitle>Tambah Item Inventaris</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nama Item *</Label>
                <Input
                  required
                  placeholder="Nama produk atau layanan"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  placeholder="Kode unik"
                  value={form.sku}
                  onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))}
                />
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
                <Input
                  type="number"
                  required
                  min={0}
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Stok Awal *</Label>
                <Input
                  type="number"
                  required
                  min={0}
                  placeholder="0"
                  value={form.stock}
                  onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Satuan</Label>
                <Input
                  placeholder="pcs, unit, liter..."
                  value={form.unit}
                  onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Stok Minimum</Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="5"
                  value={form.minStock}
                  onChange={(e) => setForm(f => ({ ...f, minStock: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
