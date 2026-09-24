import { useState, useEffect, useCallback } from 'react';

export function useScreenArmor(isActive: boolean, onSecurityBreach?: () => void) {
  const [isScreenProtected, setIsScreenProtected] = useState(false);
  const [showScreenshotWarning, setShowScreenshotWarning] = useState(false);

  const blockScreenshot = useCallback(() => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('');
      }
    } catch (_) {}
    setIsScreenProtected(true);
    setShowScreenshotWarning(true);
    if (onSecurityBreach) {
      onSecurityBreach();
    }
    setTimeout(() => setIsScreenProtected(false), 2200);
    setTimeout(() => setShowScreenshotWarning(false), 3800);
  }, [onSecurityBreach]);

  useEffect(() => {
    if (!isActive) {
      setIsScreenProtected(false);
      setShowScreenshotWarning(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Direct Capture / PrintScreen
      if (
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        e.key === 'Meta' ||
        (e.shiftKey && (e.metaKey || e.ctrlKey)) // Win+Shift+S or Ctrl+Shift+S
      ) {
        e.preventDefault();
        e.stopPropagation();
        blockScreenshot();
        return;
      }

      // Print or Save shortcuts
      const isPrint = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p';
      const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's';
      const isInspect = (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i';
      const isF12 = e.key === 'F12';

      if (isPrint || isSave || isInspect || isF12) {
        e.preventDefault();
        e.stopPropagation();
        blockScreenshot();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        blockScreenshot();
      }
    };

    const handleBlur = () => {
      setIsScreenProtected(true);
      if (onSecurityBreach) onSecurityBreach();
    };

    const handleFocus = () => {
      setIsScreenProtected(false);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsScreenProtected(true);
        if (onSecurityBreach) onSecurityBreach();
      } else {
        setIsScreenProtected(false);
      }
    };

    const handleMouseLeave = () => {
      setIsScreenProtected(true);
      if (onSecurityBreach) onSecurityBreach();
    };

    const handleMouseEnter = () => {
      if (document.hasFocus()) {
        setIsScreenProtected(false);
      }
    };

    const focusInterval = setInterval(() => {
      if (!document.hasFocus() || document.hidden) {
        setIsScreenProtected(true);
        if (onSecurityBreach) onSecurityBreach();
      }
    }, 80);

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(focusInterval);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, blockScreenshot, onSecurityBreach]);

  return {
    isScreenProtected,
    showScreenshotWarning,
    blockScreenshot,
  };
}
