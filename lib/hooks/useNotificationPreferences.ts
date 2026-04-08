import { useState, useCallback } from 'react';

const SOUND_KEY = 'casino:notification_sound';
const PERMISSION_ASKED_KEY = 'casino:push_permission_asked';

export interface NotificationPreferences {
  soundEnabled: boolean;
  pushPermission: NotificationPermission;
  pushAsked: boolean;
}

export function useNotificationPreferences() {
  const [soundEnabled, setSoundState] = useState(() =>
    localStorage.getItem(SOUND_KEY) !== 'false',
  );

  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );

  const setSoundEnabled = useCallback((v: boolean) => {
    localStorage.setItem(SOUND_KEY, String(v));
    setSoundState(v);
  }, []);

  const requestPushPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPushPermission(result);
    localStorage.setItem(PERMISSION_ASKED_KEY, 'true');
  }, []);

  return {
    soundEnabled,
    setSoundEnabled,
    pushPermission,
    requestPushPermission,
  };
}
