import './lib/api-config';
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/layout/shell";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";

// Import Landing Page yang sudah kamu tambahkan
import LandingPage from '@/pages/home'; 
import Dashboard from "@/pages/dashboard";
import Pos from "@/pages/pos";
import Contracts from "@/pages/contracts";
import ContractNew from "@/pages/contracts-new";
import ContractDetail from "@/pages/contract-detail";
import Transactions from "@/pages/transactions";
import TransactionDetail from "@/pages/transaction-detail";
import Products from "@/pages/products";
import Customers from "@/pages/customers";
import Security from "@/pages/security";
import ServiceRequest from "@/pages/service-request";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRouter() {
  const { user, isLoading, isAdmin } = useAuth();

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground animate-pulse text-sm">KM</div>
      </div>
    );
  }

  // 1. JIKA USER BELUM LOGIN (Publik)
  if (!user) {
    return (
      <Switch>
        {/* Tambahkan Landing Page di sini agar bisa diakses oleh publik */}
        <Route path="/" component={LandingPage} /> 
        <Route path="/register" component={Register} />
        {/* Rute sembarang lainnya akan otomatis diarahkan ke komponen Login */}
        <Route component={Login} />
      </Switch>
    );
  }

  // 2. JIKA USER ADALAH ADMIN
  if (isAdmin) {
    return (
      <Shell>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/pos" component={Pos} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/contracts/new" component={ContractNew} />
          <Route path="/contracts/:id" component={ContractDetail} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/transactions/:id" component={TransactionDetail} />
          <Route path="/products" component={Products} />
          <Route path="/customers" component={Customers} />
          <Route path="/security" component={Security} />
          <Route path="/service-request" component={ServiceRequest} />
          <Route path="/money-detector" component={MoneyDetector} />
          <Route component={NotFound} />
        </Switch>
      </Shell>
    );
  }

  // 3. JIKA USER ADALAH STAFF/USER BIASA
  return (
    <Shell>
      <Switch>
        <Route path="/service-request" component={ServiceRequest} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/contracts/:id" component={ContractDetail} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/transactions/:id" component={TransactionDetail} />
        <Route path="/">
          <Redirect to="/service-request" />
        </Route>
        <Route>
          <Redirect to="/service-request" />
        </Route>
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ProtectedRouter />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;