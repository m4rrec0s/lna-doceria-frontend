'use client';

import { useEffect, useState } from 'react';
import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';

export function DashboardHeader() {
  const [userName, setUserName] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserName(decoded.name || decoded.email || 'User');
      } catch {
        setUserName('User');
      }
    }
  }, []);

  if (!isClient) return null;

  return (
    <header className="dashboard-header">
      <div className="header-search">
        <Search className="search-icon" />
        <Input
          type="text"
          placeholder="Buscar produtos..."
          className="search-input"
        />
      </div>

      <div className="header-actions">
        <Button variant="ghost" size="icon" className="notification-btn">
          <Bell className="w-5 h-5" />
        </Button>

        <div className="user-menu">
          <div className="user-avatar">
            <User className="w-5 h-5" />
          </div>
          <span className="user-name">{userName}</span>
        </div>
      </div>
    </header>
  );
}
