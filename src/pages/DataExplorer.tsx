import DataExplorerView from '@/components/data-explorer/DataExplorerView';
import { SEO } from '../components/SEO';

export default function DataExplorerPage() {
  return (
    <>
      <SEO
        title="My Data"
        description="Browse and manage all your data — workspace artifacts and MongoDB collections."
        canonicalUrl="/workspace/data"
        noIndex
      />
      <DataExplorerView />
    </>
  );
}
