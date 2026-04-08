import InferPage from '@/components/infer/InferPage';
import { SEO } from '../components/SEO';

export default function Infer() {
  return (
    <>
      <SEO
        title="Open Inference Foundation — INFER & AGENT Tokens"
        description="Buy INFER. Stake it. Get cheaper AI. Build agents. Get paid when people use them."
        canonicalUrl="/infer"
        keywords={['INFER token', 'AGENT token', 'decentralized AI', 'Arbitrum', 'token economics']}
      />
      <InferPage />
    </>
  );
}
