import { useState } from "react";
import { useLocation } from "wouter";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateContract } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Wrench, Zap, CheckCircle } from "lucide-react";

const SERVICE_TYPES = [
  {
    value: "hitachi",
    label: "Hitachi",
    desc: "AC, kulkas, mesin cuci, dan peralatan Hitachi lainnya",
    icon: "❄️",
  },
  {
    value: "electrolux",
    label: "Electrolux",
    desc: "AC, kulkas, mesin cuci, dan peralatan Electrolux lainnya",
    icon: "🌊",
  },
];

export default function ServiceRequest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createContract = useCreateContract();
  const [submitted, setSubmitted] = useState(false);
  const [contractNumber, setContractNumber] = useState("");

  const [form, setForm] = useState({
    serviceType: "",
    deviceType: "",
    brand: "",
    problem: "",
    preferredDate: "",
    address: "",
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: typeof e === "string" ? e : e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.serviceType) {
      toast({ variant: "destructive", title: "Pilih Jenis Layanan", description: "Silakan pilih jenis layanan terlebih dahulu." });
      return;
    }

    const title = `Servis ${form.serviceType === "hitachi" ? "Hitachi" : "Electrolux"} — ${form.deviceType || "Perangkat"}`;
    const description = [
      form.brand ? `Merek/Tipe: ${form.brand}` : null,
      `Keluhan: ${form.problem}`,
      form.address ? `Alamat: ${form.address}` : null,
    ].filter(Boolean).join("\n");

    createContract.mutate(
      {
        data: {
          customerId: user?.customerId || 1,
          serviceType: form.serviceType,
          title,
          description,
          startDate: form.preferredDate || new Date().toISOString().split("T")[0],
          paymentMethod: "transfer",
          totalValue: 0,
        },
      },
      {
        onSuccess: (contract) => {
          setContractNumber(contract.contractNumber);
          setSubmitted(true);
          toast({ title: "Permintaan Terkirim!", description: `Nomor kontrak: ${contract.contractNumber}` });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Gagal", description: "Permintaan servis gagal dikirim. Coba lagi." });
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
          <CheckCircle className="w-14 h-14" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-emerald-500 mb-2">Permintaan Terkirim!</h2>
          <p className="text-muted-foreground mb-1">Nomor Referensi:</p>
          <p className="font-mono text-xl font-bold">{contractNumber}</p>
          <p className="text-sm text-muted-foreground mt-4 max-w-sm">
            Tim kami akan menghubungi Anda dalam 1×24 jam untuk konfirmasi jadwal servis.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setLocation("/contracts")}>
            Lihat Kontrak Saya
          </Button>
          <Button onClick={() => { setSubmitted(false); setForm({ serviceType: "", deviceType: "", brand: "", problem: "", preferredDate: "", address: "" }); }}>
            Ajukan Servis Lain
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Ajukan Permintaan Servis"
        description="Ceritakan masalah perangkat Anda. Kami siap membantu."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SERVICE_TYPES.map((st) => (
          <button
            key={st.value}
            type="button"
            onClick={() => setForm((f) => ({ ...f, serviceType: st.value }))}
            className={`text-left p-5 rounded-xl border-2 transition-all duration-200 ${
              form.serviceType === st.value
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border hover:border-primary/40 bg-card hover:bg-muted/30"
            }`}
          >
            <div className="text-3xl mb-3">{st.icon}</div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">{st.label}</span>
              {form.serviceType === st.value && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{st.desc}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-2 mb-2 pb-4 border-b">
              <Wrench className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Detail Perangkat & Keluhan</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jenis Perangkat *</Label>
                <Select value={form.deviceType} onValueChange={set("deviceType")}>
                  <SelectTrigger><SelectValue placeholder="Pilih perangkat..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC / Air Conditioner</SelectItem>
                    <SelectItem value="Kulkas">Kulkas / Lemari Es</SelectItem>
                    <SelectItem value="Mesin Cuci">Mesin Cuci</SelectItem>
                    <SelectItem value="Freezer">Freezer</SelectItem>
                    <SelectItem value="Water Heater">Water Heater</SelectItem>
                    <SelectItem value="Lainnya">Perangkat Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Merek / Tipe</Label>
                <Input placeholder="Contoh: Hitachi RAS-10" value={form.brand} onChange={set("brand")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi Masalah *</Label>
              <Textarea
                required
                placeholder="Jelaskan keluhan Anda secara detail. Contoh: AC tidak dingin, bunyi berisik, menetes air, dll."
                className="min-h-[110px]"
                value={form.problem}
                onChange={set("problem")}
              />
            </div>

            <div className="flex items-center gap-2 mb-2 pb-4 border-b pt-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Jadwal & Lokasi</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanggal Diinginkan</Label>
                <Input type="date" min={new Date().toISOString().split("T")[0]} value={form.preferredDate} onChange={set("preferredDate")} />
              </div>
              <div className="space-y-2">
                <Label>Alamat Servis</Label>
                <Input placeholder="Alamat lokasi perangkat" value={form.address} onChange={set("address")} />
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground border">
              <p><strong>Catatan:</strong> Pengajuan ini akan ditinjau oleh tim kami. Biaya servis akan dikonfirmasi setelah pemeriksaan awal. Tidak ada biaya di muka untuk pengajuan ini.</p>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={createContract.isPending || !form.serviceType || !form.problem}>
              {createContract.isPending ? "Mengirim Permintaan..." : "Kirim Permintaan Servis"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
