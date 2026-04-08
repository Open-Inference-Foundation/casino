import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ClientProviders from '@/components/ClientProviders';
import Router from './Router';
import './globals.css';

// P0-14 + P0-20: Vite + SEO/GEO-ready entry point.
// HelmetProvider wraps everything so <SEO> components can update <head> per route.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ClientProviders>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </ClientProviders>
    </HelmetProvider>
  </React.StrictMode>,
);
