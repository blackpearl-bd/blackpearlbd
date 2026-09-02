import { Outlet } from 'react-router-dom';
import { AppShell } from './AppShell';
import { PageTitle } from './PageTitle';
import { useInitializeBookmarks } from '@/hooks/useBookmarks';

function BookmarkInitializer() {
  useInitializeBookmarks();
  return null;
}

export function RootLayout() {
  return (
    <AppShell>
      <PageTitle />
      <BookmarkInitializer />
      <Outlet />
    </AppShell>
  );
}
