import { useEffect, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import { MonitorIcon, MoonIcon, SunIcon } from '@/components/ui/icons.tsx';
import { cn } from '@/lib/utils.ts';

type Theme = 'light' | 'dark' | 'system';
const THEME_STORAGE_KEY = 'theme';

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

function applyThemeClass(theme: Theme) {
  const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && systemDark));
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export default function ThemeToggle({ variant = 'pill' }: { variant?: 'inline' | 'pill' }) {
  const [theme, setThemeState] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    const current = readStoredTheme();
    setThemeState(current);
    applyThemeClass(current);
    const media = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeClass(readStoredTheme());
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore storage failures
    }
    applyThemeClass(next);
  }

  return (
    <div
      className={
        variant === 'inline'
          ? 'inline-flex items-center gap-0.5'
          : 'border-divider dark:border-divider-dark inline-flex items-center rounded-full border p-0.5'
      }
    >
      <ToggleButton active={theme === 'light'} label="Light mode" onClick={() => setTheme('light')}>
        <SunIcon className="size-4" />
      </ToggleButton>
      <ToggleButton active={theme === 'dark'} label="Dark mode" onClick={() => setTheme('dark')}>
        <MoonIcon className="size-4" />
      </ToggleButton>
      <ToggleButton active={theme === 'system'} label="System theme" onClick={() => setTheme('system')}>
        <MonitorIcon className="size-4" />
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: ComponentChildren;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'rounded-full p-1.5 transition-colors',
        active
          ? 'bg-card dark:bg-card-dark text-black dark:text-white'
          : 'text-muted hover:text-black dark:hover:text-white',
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
