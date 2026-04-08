import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import WorkspaceLayout from './layouts/WorkspaceLayout';

// Landing is the most common entry point — eager load it for fastest TTI.
import Landing from './pages/Landing';

// P0-20 performance: lazy-load every other route so the initial bundle only
// contains the landing page + providers. Routes users rarely hit (/terms,
// /privacy) don't bloat the first-paint bundle.
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Complete = lazy(() => import('./pages/Complete'));
const Workspace = lazy(() => import('./pages/Workspace'));
const DataExplorer = lazy(() => import('./pages/DataExplorer'));
const Infer = lazy(() => import('./pages/Infer'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const MobileChat = lazy(() => import('./pages/MobileChat'));

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--color-bg)]">
      <span className="w-6 h-6 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] spin" />
    </div>
  );
}

export default function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Auth pages share an auth layout (logo + centered content) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete" element={<Complete />} />
        </Route>

        {/* Workspace routes are auth-gated */}
        <Route element={<WorkspaceLayout />}>
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/workspace/data" element={<DataExplorer />} />
        </Route>

        <Route path="/api/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/chat" element={<MobileChat />} />
        <Route path="/infer" element={<Infer />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* SPA fallback — unknown routes show the landing page.
            CloudFront custom error responses handle the 404 → index.html
            fallback at the CDN layer; this handles client-side nav. */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </Suspense>
  );
}
