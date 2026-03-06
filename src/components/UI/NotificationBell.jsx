import { useState, useEffect } from 'react';
import {
  isPushSupported, getNotifPermission,
  subscribeToPush, unsubscribeFromPush,
} from '../../utils/notifications';
import { useLanguage } from '../../contexts/LanguageContext';
import './NotificationBell.css';

export default function NotificationBell() {
  const { lang } = useLanguage();
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPushSupported()) setPermission(getNotifPermission());
  }, []);

  if (!isPushSupported()) return null;

  const isGranted = permission === 'granted';
  const isDenied = permission === 'denied';

  const label = isDenied
    ? (lang === 'ar' ? 'الإشعارات محظورة' : 'Notifications blocked')
    : isGranted
      ? (lang === 'ar' ? 'إلغاء الإشعارات' : 'Disable notifications')
      : (lang === 'ar' ? 'تفعيل الإشعارات' : 'Enable notifications');

  const handleClick = async () => {
    if (isDenied || loading) return;
    setLoading(true);
    try {
      if (isGranted) {
        await unsubscribeFromPush();
        setPermission('default');
      } else {
        const sub = await subscribeToPush();
        setPermission(sub ? 'granted' : getNotifPermission());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`notif-bell ${isGranted ? 'notif-bell--on' : ''} ${isDenied ? 'notif-bell--denied' : ''}`}
      onClick={handleClick}
      title={label}
      aria-label={label}
      disabled={loading || isDenied}
    >
      {loading ? (
        <span className="notif-bell__spinner" />
      ) : isGranted ? (
        /* Bell with slash (active) */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        /* Bell (inactive) */
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      )}
    </button>
  );
}
