import LoginForm from '@/components/auth/LoginForm';
import { SEO } from '../components/SEO';

export default function Login() {
  return (
    <>
      <SEO
        title="Sign In"
        description="Sign in to Ca$ino Builder to manage your apps and build new ones."
        canonicalUrl="/login"
        noIndex
      />
      <LoginForm />
    </>
  );
}
