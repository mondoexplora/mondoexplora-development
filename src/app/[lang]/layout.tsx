import { ReactNode } from 'react';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { lang } = await params;
  
  return (
    <div data-lang={lang}>
      {children}
    </div>
  );
} 