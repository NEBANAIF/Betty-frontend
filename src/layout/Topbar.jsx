import React from 'react';
import { useLocation } from 'react-router-dom';
import BranchSelector from '../branch/BranchSelector.jsx';
import Icon from '../components/Icon.jsx';
import NotificationBell from '../components/NotificationBell.jsx';
import UserMenu from '../components/UserMenu.jsx';
import { NAV_SECTIONS } from '../navigation.js';

export default function Topbar({ onOpenMenu }) {
  const { pathname } = useLocation();
  const current = NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.to === pathname);

  return (
    <header
      className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center justify-between gap-y-2 gap-x-3 px-3 py-2 sm:flex-nowrap sm:px-5"
      style={{
        background: 'var(--bg-translucent)',
        borderBottom: '1px solid rgba(140,128,70,0.18)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <div className="flex min-w-0 basis-full items-center gap-2 sm:basis-auto sm:gap-3">
        <button onClick={onOpenMenu} className="btn-icon md:hidden" aria-label="Open menu">
          <Icon name="menu" size={20} />
        </button>
        {current && (
          <div className="hidden min-w-0 items-center gap-2 sm:flex">
            <span style={{ color: '#a3a676' }}>
              <Icon name={current.icon || 'dashboard'} size={16} />
            </span>
            <span className="truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
              {current.label}
            </span>
            <span className="mx-1 h-4 w-px" style={{ background: 'rgba(140,128,70,0.22)' }} aria-hidden="true" />
          </div>
        )}
        <BranchSelector />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
