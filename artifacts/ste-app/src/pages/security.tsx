import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useGetSecurityStats, 
  getGetSecurityStatsQueryKey,
  useListAuditLogs,
  getListAuditLogsQueryKey
} from "@workspace/api-client-react";
import { Shield, ShieldAlert, ShieldCheck, Activity, Server, Database, Key, Wifi, Fingerprint } from "lucide-react";
import { formatDate } from "@/lib/format";

export default function Security() {
  const { data: stats, isLoading: loadingStats } = useGetSecurityStats({
    query: { queryKey: getGetSecurityStatsQueryKey() }
  });

  const { data: logs, isLoading: loadingLogs } = useListAuditLogs(
    { limit: 20 },
    { query: { queryKey: getListAuditLogsQueryKey({ limit: 20 }) } }
  );

  const getLayerIcon = (layer: string) => {
    switch(layer.toLowerCase()) {
      case 'jaringan': return <Wifi className="w-5 h-5" />;
      case 'aplikasi': return <Server className="w-5 h-5" />;
      case 'autentikasi': return <Fingerprint className="w-5 h-5" />;
      case 'data': return <Database className="w-5 h-5" />;
      case 'api': return <Activity className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Security Posture" 
        description="System defense layers and real-time audit monitoring."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI Summary */}
        <Card className="bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Events (24h)</p>
              <h3 className="text-2xl font-bold">{loadingStats ? "..." : stats?.todayEvents || 0}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-destructive/30">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center text-destructive">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-destructive/80">Active Alerts</p>
              <h3 className="text-2xl font-bold text-destructive">{loadingStats ? "..." : stats?.activeAlerts || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Logged Actions</p>
              <h3 className="text-2xl font-bold">{loadingStats ? "..." : stats?.totalAuditLogs || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Defense Layers */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Defense Layers</CardTitle>
            <CardDescription>7-Layer Security Implementation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingStats ? (
               <div className="py-8 text-center text-muted-foreground">Loading architecture...</div>
            ) : stats?.securityLayers?.map((layer, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/10">
                <div className={`p-2 rounded ${layer.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                  {getLayerIcon(layer.layer)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{layer.layer}</span>
                    <Badge variant={layer.status === 'active' ? 'outline' : 'destructive'} className="text-[10px] uppercase">
                      {layer.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{layer.mechanism}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>Immutable record of system changes</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
               <div className="py-8 text-center text-muted-foreground">Loading logs...</div>
            ) : logs?.length === 0 ? (
               <div className="py-8 text-center text-muted-foreground">No audit logs found</div>
            ) : (
              <div className="space-y-0">
                {logs?.map((log, idx) => (
                  <div key={log.id} className={`flex gap-4 p-3 text-sm border-b last:border-0 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'}`}>
                    <div className="w-24 flex-shrink-0 text-muted-foreground font-mono text-xs pt-0.5">
                      {formatDate(log.createdAt).split(' ')[1]}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-primary mr-2">{log.action}</span>
                      <span className="text-muted-foreground">on</span>
                      <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs ml-2 mr-2">
                        {log.entityType}{log.entityId ? `:${log.entityId}` : ''}
                      </span>
                      <span className="text-muted-foreground">by</span>
                      <span className="font-medium ml-2">{log.performedBy}</span>
                      
                      {log.details && (
                        <p className="mt-1 text-xs text-muted-foreground border-l-2 border-border pl-2">
                          {log.details}
                        </p>
                      )}
                    </div>
                    <div className="hidden sm:block text-xs text-muted-foreground font-mono">
                      {log.ipAddress || 'unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
