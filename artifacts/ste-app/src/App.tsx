import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/layout/shell";
import NotFound from "@/pages/not-found";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/pos" component={Pos} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/contracts/new" component={ContractNew} />
        <Route path="/contracts/:id" component={ContractDetail} />
        <Route path="/transactions" component={Transactions} />
        <Route path="/transactions/:id" component={TransactionDetail} />
        <Route path="/products" component={Products} />
        <Route path="/customers" component={Customers} />
        <Route path="/security" component={Security} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
