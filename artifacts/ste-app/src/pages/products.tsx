import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  useListProducts, 
  getListProductsQueryKey
} from "@workspace/api-client-react";
import { formatIDR } from "@/lib/format";
import { Search, Plus, AlertCircle, Package } from "lucide-react";

export default function Products() {
  const [search, setSearch] = useState("");
  
  const { data: products, isLoading } = useListProducts(
    { search: search || undefined },
    { query: { queryKey: getListProductsQueryKey({ search: search || undefined }) } }
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventory" 
        description="Manage spare parts, services, and consumables."
      >
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </PageHeader>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or SKU..." 
          className="pl-9 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>
        ) : products?.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
            <Package className="w-12 h-12 mb-4 opacity-20" />
            <p>No products found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
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
                        {product.category.replace('_', ' ')}
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
                        {isLowStock && <AlertCircle className="w-4 h-4 text-destructive" aria-label="Low Stock" />}
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
    </div>
  );
}
