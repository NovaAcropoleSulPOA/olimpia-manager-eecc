import { Outlet } from 'react-router-dom';
import { Sidebar } from './ui/sidebar';

export function MainNavigation() {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="bg-olimpics-green-primary text-white" />
      <main className="flex-1 p-6 bg-olimpics-background">
        <Outlet />
      </main>
    </div>
  );
}