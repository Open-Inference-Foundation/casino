import Workspace from '@/components/workspace/Workspace';
import { SEO } from '../components/SEO';

export default function WorkspacePage() {
  return (
    <>
      <SEO
        title="Workspace"
        description="Your Ca$ino Builder workspace — build and manage AI-powered apps."
        canonicalUrl="/workspace"
        noIndex
      />
      <Workspace />
    </>
  );
}
