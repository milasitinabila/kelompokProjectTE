import { Router, type IRouter } from "express";
import { desc, count } from "drizzle-orm";
import { db, auditLogsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/audit-logs", async (req, res): Promise<void> => {
  const action = req.query.action as string | undefined;
  const entityType = req.query.entityType as string | undefined;
  const limit = parseInt((req.query.limit as string) ?? "50", 10);

  const logs = await db.select().from(auditLogsTable)
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(limit);

  const filtered = logs.filter(l => {
    if (action && !l.action.includes(action.toUpperCase())) return false;
    if (entityType && l.entityType !== entityType) return false;
    return true;
  });

  res.json(filtered);
});

router.get("/security/stats", async (_req, res): Promise<void> => {
  const [totalRow] = await db.select({ total: count() }).from(auditLogsTable);
  const totalAuditLogs = Number(totalRow?.total ?? 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allLogs = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt));
  const todayLogs = allLogs.filter(l => new Date(l.createdAt) >= today);
  const todayEvents = todayLogs.length;

  const recentEvents = allLogs.slice(0, 10).map(l => ({
    time: new Date(l.createdAt).toLocaleTimeString("id-ID"),
    event: `${l.action} on ${l.entityType}${l.entityId ? ` #${l.entityId}` : ""}`,
    level: l.action.includes("DELETE") || l.action.includes("CANCEL") ? "warning" : "info",
  }));

  res.json({
    totalAuditLogs,
    todayEvents,
    activeAlerts: 0,
    securityLayers: [
      { layer: "Jaringan", status: "active", mechanism: "Firewall, VPN, WAF, DDoS Protection", standard: "Cloudflare, AWS Shield" },
      { layer: "Aplikasi", status: "active", mechanism: "Input validation, CSRF, XSS prevention", standard: "OWASP Top 10" },
      { layer: "Autentikasi", status: "active", mechanism: "MFA, JWT, OAuth2, session timeout", standard: "RFC 6749, TOTP" },
      { layer: "Data", status: "active", mechanism: "Enkripsi AES-256 at rest, TLS 1.3 in transit", standard: "FIPS 140-2" },
      { layer: "API", status: "active", mechanism: "Rate limiting, API key rotation, mTLS", standard: "Kong Gateway" },
      { layer: "Kontainer", status: "active", mechanism: "Non-root containers, image scanning", standard: "Trivy, Snyk" },
      { layer: "Audit", status: "active", mechanism: "Log semua aktivitas, SIEM monitoring", standard: "ELK Stack" },
    ],
    recentEvents,
  });
});

export default router;
