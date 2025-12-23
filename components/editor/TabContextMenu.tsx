'use client';

import { memo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, Pencil, XCircle } from 'lucide-react';

interface TabContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  fileId: string;
  fileName: string;
  onClose: () => void;
  onCloseTab: () => void;
  onCloseOtherTabs: () => void;
  onCloseAllTabs: () => void;
  onDuplicate: () => void;
  onRename: () => void;
}

export const TabContextMenu = memo(function TabContextMenu({
  isOpen,
  position,
  onClose,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onDuplicate,
  onRename,
}: TabContextMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // 少し遅延させてからリスナーを追加（長押し完了直後のtouchendを無視するため）
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESCキーで閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 画面端を考慮した位置調整
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y, window.innerHeight - 250),
  };

  const menuItems = [
    { icon: X, label: t('tabMenu.close'), action: onCloseTab },
    { icon: XCircle, label: t('tabMenu.closeOthers'), action: onCloseOtherTabs },
    { icon: XCircle, label: t('tabMenu.closeAll'), action: onCloseAllTabs },
    { type: 'divider' as const },
    { icon: Copy, label: t('tabMenu.duplicate'), action: onDuplicate },
    { icon: Pencil, label: t('tabMenu.rename'), action: onRename },
  ];

  return (
    <>
      {/* バックドロップ */}
      <div className="fixed inset-0 z-[70]" aria-hidden="true" />

      {/* メニュー */}
      <div
        ref={menuRef}
        className="mochi-context-menu"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
        role="menu"
        aria-label={t('tabMenu.close')}
      >
        {menuItems.map((item, index) => {
          if ('type' in item && item.type === 'divider') {
            return (
              <div
                key={`divider-${index}`}
                className="h-px bg-border/50 my-1 mx-2"
                role="separator"
              />
            );
          }

          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className="mochi-mobile-menu-item w-full text-left"
              onClick={() => {
                item.action();
                onClose();
              }}
            >
              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
});
