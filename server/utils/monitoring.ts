import * as Sentry from '@sentry/node';
import { Analytics } from '@segment/analytics-node';
import { logger } from './logger';

// Initialize Sentry for error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: true }),
  ],
});

// Initialize Segment for analytics
const analytics = new Analytics({
  writeKey: process.env.SEGMENT_WRITE_KEY || '',
});

// Custom monitoring functions
export const monitoring = {
  // Track API performance
  trackApiPerformance: (endpoint: string, duration: number, status: number) => {
    try {
      Sentry.addBreadcrumb({
        category: 'api',
        message: `API ${endpoint} took ${duration}ms with status ${status}`,
        level: 'info',
      });

      analytics.track({
        event: 'API Performance',
        properties: {
          endpoint,
          duration,
          status,
        },
      });
    } catch (error) {
      logger.error('Error tracking API performance:', error);
    }
  },

  // Track user interactions
  trackUserInteraction: (userId: string, action: string, metadata: any) => {
    try {
      analytics.track({
        userId,
        event: action,
        properties: metadata,
      });
    } catch (error) {
      logger.error('Error tracking user interaction:', error);
    }
  },

  // Track error events
  trackError: (error: Error, context: any = {}) => {
    try {
      Sentry.withScope((scope) => {
        scope.setExtras(context);
        Sentry.captureException(error);
      });
    } catch (err) {
      logger.error('Error tracking error event:', err);
    }
  },

  // Track system metrics
  trackSystemMetrics: () => {
    try {
      const metrics = {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
      };

      analytics.track({
        event: 'System Metrics',
        properties: metrics,
      });
    } catch (error) {
      logger.error('Error tracking system metrics:', error);
    }
  },

  // Track user progress and achievements
  trackUserProgress: (userId: string, progressData: any) => {
    try {
      analytics.track({
        userId,
        event: 'User Progress',
        properties: progressData,
      });
    } catch (error) {
      logger.error('Error tracking user progress:', error);
    }
  },
};

// Express middleware for request tracking
export const requestTracker = (req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    monitoring.trackApiPerformance(
      req.originalUrl,
      duration,
      res.statusCode
    );
  });

  next();
};

// Export Sentry handlers for Express
export const sentryHandlers = {
  requestHandler: Sentry.Handlers.requestHandler(),
  errorHandler: Sentry.Handlers.errorHandler(),
  tracingHandler: Sentry.Handlers.tracingHandler(),
};