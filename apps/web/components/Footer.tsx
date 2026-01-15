import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Palestine Real Estate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

