import RegisterForm from '@/components/auth/RegisterForm';
import { SEO } from '../components/SEO';

export default function Register() {
  return (
    <>
      <SEO
        title="Create Account"
        description="Create a Ca$ino Builder account and start building AI-powered apps in minutes. 60 free credits daily."
        canonicalUrl="/register"
        noIndex
      />
      <RegisterForm />
    </>
  );
}
