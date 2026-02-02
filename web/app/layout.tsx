import './globals.css';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'Socially Bot Dashboard',
  description: 'Public dashboard for Socially autonomous bounty bot'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
