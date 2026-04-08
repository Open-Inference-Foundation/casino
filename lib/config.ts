import type { FlowstackConfig } from '@flowstack/sdk';

export function getFlowstackConfig(): FlowstackConfig {
  return {
    mode: (process.env.NEXT_PUBLIC_FLOWSTACK_MODE as 'mock' | 'production') ?? 'production',
    jwtSecret: process.env.NEXT_PUBLIC_FLOWSTACK_JWT_SECRET ?? 'dev-secret',
    passwordSecret: process.env.NEXT_PUBLIC_FLOWSTACK_PASSWORD_SECRET ?? 'dev-password-secret',
    tenantId: process.env.NEXT_PUBLIC_FLOWSTACK_TENANT_ID ?? 'casino-dev',
    baseUrl: process.env.NEXT_PUBLIC_FLOWSTACK_BASE_URL ?? 'https://sage-api.flowstack.fun',
    auth: {
      providers: ['email', 'google'],
      googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    },
  };
}
