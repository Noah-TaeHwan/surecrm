import { Link } from 'react-router';
import { useHydrationSafeTranslation } from '~/lib/i18n/use-hydration-safe-translation';
import { Button } from '../../components/ui/button';

export function meta() {
  return [
    {
      title: 'Page Not Found - SureCRM',
      description: 'The requested page could not be found',
    },
  ];
}

export default function NotFoundPage() {
  const { t } = useHydrationSafeTranslation('common');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="text-7xl font-bold text-primary mb-2">
        {t('notFound.code')}
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        {t('notFound.title')}
      </h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        {t('notFound.description')}
        <br />
        {t('notFound.description2')}
      </p>
      <div className="flex flex-col gap-2">
        <Button asChild variant="default">
          <Link to="/" className="px-6">
            {t('notFound.goHome')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
