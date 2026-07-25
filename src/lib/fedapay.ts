import { Customer, FedaPay, Transaction } from 'fedapay';

function normalizeEnvironment(value: string | undefined): 'live' | 'sandbox' | 'development' | null {
  const normalized = (value || '').trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  if (normalized === 'live' || normalized === 'production') {
    return 'live';
  }

  if (normalized === 'development' || normalized === 'dev') {
    return 'development';
  }

  if (normalized === 'sandbox' || normalized === 'test') {
    return 'sandbox';
  }

  return null;
}

function resolveFedapayEnvironment() {
  const explicitEnvironment = normalizeEnvironment(process.env.FEDAPAY_ENVIRONMENT);

  if (explicitEnvironment) {
    return explicitEnvironment;
  }

  const secretKey = (process.env.FEDAPAY_SECRET_KEY || '').trim();

  if (secretKey.startsWith('sk_live')) {
    return 'live';
  }

  if (secretKey.startsWith('sk_sandbox') || secretKey.startsWith('sk_test')) {
    return 'sandbox';
  }

  return 'sandbox';
}

function resolveFedapayApiBase(environment: 'live' | 'sandbox' | 'development') {
  const explicitBase = (process.env.FEDAPAY_API_BASE || '').trim();

  if (explicitBase) {
    return explicitBase.replace(/\/$/, '');
  }

  switch (environment) {
    case 'live':
      return 'https://api.fedapay.com';
    case 'development':
      return 'https://dev-api.fedapay.com';
    case 'sandbox':
    default:
      return 'https://sandbox-api.fedapay.com';
  }
}

const fedapayEnvironment = resolveFedapayEnvironment();

FedaPay.setApiKey((process.env.FEDAPAY_SECRET_KEY || '').trim());
FedaPay.setEnvironment(fedapayEnvironment);
FedaPay.setApiBase(resolveFedapayApiBase(fedapayEnvironment));
FedaPay.setApiVersion('v1');

export { Customer, FedaPay, Transaction };
