import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCreateCustomer } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const createCustomer = useCreateCustomer();

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const customer = await new Promise((resolve, reject) => {
        createCustomer.mutate(
          {
            data: {
              name: form.name,
              phone: form.phone,
              email: form.email || undefined,
              address: form.address || undefined,
            },
          },
          { onSuccess: resolve, onError: reject }
        );
      });

      const result = register({
        username: form.username,
        password: form.password,
        name: form.name,
        customerId: customer.id,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setLocation("/service-request");
    } catch {
      setError("Pendaftaran gagal. Pastikan data sudah benar dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background py-10">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center font-bold text-primary-foreground text-2xl mx-auto mb-4">
            KM
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Pelanggan</h1>
          <p className="text-muted-foreground text-sm mt-1">Buat akun untuk melacak servis Anda</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap *</Label>
                <Input required placeholder="Nama lengkap Anda" value={form.name} onChange={set("name")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username *</Label>
                  <Input required placeholder="username unik" value={form.username} onChange={set("username")} autoComplete="username" />
                </div>
                <div className="space-y-2">
                  <Label>No. Telepon *</Label>
                  <Input required type="tel" placeholder="08xx-xxxx" value={form.phone} onChange={set("phone")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@contoh.com" value={form.email} onChange={set("email")} />
              </div>

              <div className="space-y-2">
                <Label>Alamat</Label>
                <Input placeholder="Alamat lengkap" value={form.address} onChange={set("address")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input required type="password" placeholder="Min. 6 karakter" value={form.password} onChange={set("password")} autoComplete="new-password" />
                </div>
                <div className="space-y-2">
                  <Label>Konfirmasi Password *</Label>
                  <Input required type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={set("confirmPassword")} autoComplete="new-password" />
                </div>
              </div>

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? "Mendaftar..." : "Daftar Sekarang"}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
