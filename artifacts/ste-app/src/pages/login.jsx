import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (!ok) {
      setError("Username atau password salah. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center font-bold text-primary-foreground text-2xl mx-auto mb-4">
            KM
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Karya Mandiri</h1>
          <p className="text-muted-foreground text-sm mt-1">Sistem Transaksi Elektronik</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-border/50">
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Daftar Akun Pelanggan Baru
                </Button>
              </Link>
            </div>

            <div className="mt-5 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center mb-3">Akun staf tersedia:</p>
              <div className="space-y-1.5 text-xs text-muted-foreground font-mono">
                <div className="flex justify-between bg-muted/30 px-3 py-1.5 rounded">
                  <span>admin</span><span className="text-muted-foreground/60">admin123</span>
                </div>
                <div className="flex justify-between bg-muted/30 px-3 py-1.5 rounded">
                  <span>pelanggan</span><span className="text-muted-foreground/60">pelanggan123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; 2026 Karya Mandiri. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
