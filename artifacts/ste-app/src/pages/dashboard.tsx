import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatIDR, formatDate } from "@/lib/format";
import { 
  useGetDashboardSummary, 
  getGetDashboardSummaryQueryKey,
  useGetRevenueChart,
  getGetRevenueChartQueryKey,
  useGetRecentActivity,
  getGetRecentActivityQueryKey,
  useGetContractStats,
  getGetContractStatsQueryKey
} from "@workspace/api-client-react";
import { 
  Wallet, 
  Receipt, 
  FileSignature, 
  Users,
  Activity,
  AlertTriangle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() }
  });
  const { data: revenueChart, isLoading: loadingChart } = useGetRevenueChart({
    query: { queryKey: getGetRevenueChartQueryKey() }
  });
  const { data: recentActivity, isLoading: loadingActivity } = useGetRecentActivity({
    query: { queryKey: getGetRecentActivityQueryKey() }
  });
  const { data: contractStats, isLoading: loadingStats } = useGetContractStats({
    query: { queryKey: getGetContractStatsQueryKey() }
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Command Center" 
        description="System overview and daily performance metrics." 
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingSummary ? "..." : formatIDR(summary?.revenueToday || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {loadingSummary ? "..." : `${summary?.transactionsToday || 0} transactions`}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Contracts</CardTitle>
            <FileSignature className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingSummary ? "..." : summary?.activeContracts || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {loadingSummary ? "..." : `${summary?.pendingContracts || 0} pending review`}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingSummary ? "..." : summary?.totalCustomers || 0}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">System Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {loadingSummary ? "..." : summary?.lowStockProducts || 0}
            </div>
            <p className="text-xs text-destructive/80 mt-1">
              Low stock items
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>30-day transaction volume and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {loadingChart ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>
              ) : revenueChart && revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `Rp${(value/1000000).toFixed(0)}M`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [formatIDR(value), "Revenue"]}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contract Stats & Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Contract Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                 <div className="py-4 text-center text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Draft</span>
                    <span className="font-bold">{contractStats?.draft || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-bold text-primary">{contractStats?.active || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="font-bold text-emerald-500">{contractStats?.completed || 0}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <span className="text-sm font-medium">Pipeline Value</span>
                    <span className="font-bold">{formatIDR(contractStats?.totalValue || 0)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingActivity ? (
                 <div className="py-4 text-center text-muted-foreground">Loading...</div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full ${
                        activity.type === 'transaction' ? 'bg-primary' : 
                        activity.type === 'contract' ? 'bg-accent' : 
                        activity.type === 'security' ? 'bg-destructive' : 'bg-muted'
                      }`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        {activity.amount && (
                          <p className="text-xs font-medium text-foreground">{formatIDR(activity.amount)}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground">{formatDate(activity.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground text-sm">No recent activity</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
