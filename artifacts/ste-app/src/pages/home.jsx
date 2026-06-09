import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Wrench,
  FileText,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">Karya Mandiri</h1>
            <p className="text-xs text-muted-foreground">Sistem Transaksi Elektronik</p>
          </div>

          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline">Masuk</Button>
            </Link>

            <Link href="/register">
              <Button>Daftar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm mb-6">
            🔧 Servis Profesional Hitachi & Electrolux
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Solusi Servis Elektronik
            <span className="text-primary block">Cepat, Aman, dan Terpercaya</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Kelola permintaan servis, kontrak layanan, transaksi, dan pembayaran dalam satu sistem yang mudah digunakan.
          </p>

          <div className="flex flex-wrap gap-4">
            {/* PERUBAHAN: Link "Mulai Sekarang" diubah ke /service-request */}
            <Link href="/service-request">
              <Button size="lg">
                Mulai Sekarang
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/login">
              <Button size="lg" variant="outline">
                Login Sistem
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Layanan Kami</h2>
          <p className="text-muted-foreground">Semua kebutuhan servis elektronik dalam satu platform.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <Wrench className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Permintaan Servis</h3>
              <p className="text-sm text-muted-foreground">Ajukan servis perangkat elektronik secara online.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <FileText className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Kontrak Digital</h3>
              <p className="text-sm text-muted-foreground">Pantau status kontrak dan layanan secara real-time.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <CreditCard className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Pembayaran Mudah</h3>
              <p className="text-sm text-muted-foreground">Invoice dan pembayaran terintegrasi.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <ShieldCheck className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Sistem Aman</h3>
              <p className="text-sm text-muted-foreground">Data pelanggan terlindungi dengan baik.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-3xl font-bold text-primary">1000+</h3>
              <p className="text-sm text-muted-foreground">Pelanggan</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-3xl font-bold text-primary">24/7</h3>
              <p className="text-sm text-muted-foreground">Dukungan</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-3xl font-bold text-primary">99%</h3>
              <p className="text-sm text-muted-foreground">Kepuasan</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="text-3xl font-bold text-primary">10+</h3>
              <p className="text-sm text-muted-foreground">Tahun Pengalaman</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Siap Memperbaiki Perangkat Anda?</h2>
          <p className="opacity-90 mb-8 max-w-xl mx-auto">
            Ajukan permintaan servis sekarang dan tim kami akan segera menghubungi Anda.
          </p>

          {/* PERUBAHAN: Link di CTA bawah juga diubah ke /service-request */}
          <Link href="/service-request">
            <Button variant="secondary" size="lg">
              Mulai Sekarang
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}