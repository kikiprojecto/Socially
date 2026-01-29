import './globals.css';

import type { ReactNode } from 'react';

export const metadata = {
  title: 'POIDH Bot Dashboard',
  description: 'Public dashboard for POIDH autonomous bounty bot'
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
