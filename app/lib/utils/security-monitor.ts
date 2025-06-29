// Security monitoring and alerting system
interface SecurityEvent {
  id: string;
  timestamp: Date;
  type:
    | 'rate_limit'
    | 'spam_attempt'
    | 'bot_detection'
    | 'suspicious_ip'
    | 'content_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent: string;
  details: Record<string, any>;
}

class SecurityMonitor {
  private static instance: SecurityMonitor;
  private events: SecurityEvent[] = [];
  private alertThresholds = {
    rate_limit: 3,
    spam_attempt: 2,
    bot_detection: 5,
    suspicious_ip: 4,
    content_violation: 2,
  };

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  logEvent(
    type: SecurityEvent['type'],
    ip: string,
    userAgent: string,
    details: Record<string, any>,
    severity: SecurityEvent['severity'] = 'medium'
  ) {
    const event: SecurityEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      severity,
      ip,
      userAgent,
      details,
    };

    this.events.push(event);
    console.log(
      `[SECURITY MONITOR] ${event.type.toUpperCase()} - ${event.severity} - IP: ${ip}`,
      details
    );

    // Check if we need to send alert
    this.checkAlertThresholds(type, ip);

    // Cleanup old events (keep last 1000)
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  private checkAlertThresholds(type: SecurityEvent['type'], ip: string) {
    const recentEvents = this.getRecentEvents(60 * 60 * 1000); // Last hour
    const eventsOfType = recentEvents.filter(
      e => e.type === type && e.ip === ip
    );

    if (eventsOfType.length >= this.alertThresholds[type]) {
      this.sendSecurityAlert(type, ip, eventsOfType);
    }
  }

  private async sendSecurityAlert(
    type: SecurityEvent['type'],
    ip: string,
    events: SecurityEvent[]
  ) {
    const alertData = {
      type: 'SECURITY_ALERT',
      timestamp: new Date().toISOString(),
      alertType: type,
      ip,
      eventCount: events.length,
      events: events.map(e => ({
        timestamp: e.timestamp,
        severity: e.severity,
        details: e.details,
      })),
    };

    // Log to console (in production, send to monitoring service)
    console.error('[SECURITY ALERT]', alertData);

    // In production, implement:
    // - Send email alert
    // - Send to Slack/Discord webhook
    // - Send to monitoring service (Datadog, Sentry, etc.)
    // - Trigger automatic IP blocking if needed
  }

  getRecentEvents(timeWindow: number = 60 * 60 * 1000): SecurityEvent[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return this.events.filter(e => e.timestamp >= cutoff);
  }

  getSecurityReport(hours: number = 24): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    topIPs: Array<{ ip: string; count: number }>;
    severityBreakdown: Record<string, number>;
  } {
    const events = this.getRecentEvents(hours * 60 * 60 * 1000);

    const eventsByType: Record<string, number> = {};
    const ipCounts: Record<string, number> = {};
    const severityBreakdown: Record<string, number> = {};

    events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
      severityBreakdown[event.severity] =
        (severityBreakdown[event.severity] || 0) + 1;
    });

    const topIPs = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    return {
      totalEvents: events.length,
      eventsByType,
      topIPs,
      severityBreakdown,
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // IP reputation checking
  async checkIPReputation(ip: string): Promise<{
    isBlacklisted: boolean;
    riskScore: number;
    sources: string[];
  }> {
    // In production, integrate with IP reputation services like:
    // - AbuseIPDB
    // - VirusTotal
    // - MaxMind
    // - Cloudflare IP Intelligence

    // Mock implementation for now
    const knownBadIPs = [
      '192.168.1.100', // Example bad IP
      '10.0.0.1', // Example bad IP
    ];

    const isBlacklisted = knownBadIPs.includes(ip);
    const riskScore = isBlacklisted ? 95 : Math.random() * 20; // 0-100 scale

    return {
      isBlacklisted,
      riskScore,
      sources: isBlacklisted ? ['internal_blacklist'] : [],
    };
  }

  // Geographic analysis
  async analyzeGeographicPattern(ip: string): Promise<{
    country: string;
    isHighRiskCountry: boolean;
    isVPN: boolean;
  }> {
    // In production, use services like:
    // - MaxMind GeoIP
    // - Cloudflare Analytics
    // - IP2Location

    // Mock implementation
    return {
      country: 'US',
      isHighRiskCountry: false,
      isVPN: false,
    };
  }
}

export const securityMonitor = SecurityMonitor.getInstance();
