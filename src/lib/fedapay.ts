import { FedaPay, Transaction } from 'fedapay';

function resolveFedapayEnvironment() {
  const secretKey = process.env.FEDAPAY_SECRET_KEY || '';
  const envFromKey = secretKey.startsWith('sk_live')
    ? 'live'
    : secretKey.startsWith('sk_sandbox')
      ? 'sandbox'
      : null;

  return envFromKey || (process.env.FEDAPAY_ENVIRONMENT as 'live' | 'sandbox') || 'sandbox';
}

// Initialisation de FedaPay
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || '');
FedaPay.setEnvironment(resolveFedapayEnvironment());

export { FedaPay, Transaction };
