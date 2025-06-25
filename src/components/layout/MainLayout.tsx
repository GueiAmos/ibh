
import { ModernLayout } from './ModernLayout';

export interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return <ModernLayout>{children}</ModernLayout>;
}
