import { FedaPay, Transaction } from 'fedapay';

// Initialisation de FedaPay
FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY || '');
FedaPay.setEnvironment((process.env.FEDAPAY_ENVIRONMENT as 'live' | 'sandbox') || 'sandbox');

export { FedaPay, Transaction };
