import { useState } from 'react';
import {
  ChevronDownIcon,
  UserIcon,
  GlobeIcon,
  PaletteIcon,
  SmartphoneIcon,
  MonitorIcon,
  SettingsIcon,
  BellIcon,
  ShieldCheckIcon,
  LanguagesIcon,
} from 'lucide-react';

import {
  MobileSelect,
  MobileSelectContent,
  MobileSelectItem,
  MobileSelectTrigger,
  MobileSelectValue,
  MobileSelectGroup,
  MobileSelectLabel,
  MobileSelectSeparator,
  ResponsiveSelect,
  ResponsiveSelectContent,
  ResponsiveSelectItem,
  ResponsiveSelectTrigger,
  ResponsiveSelectValue,
  ResponsiveSelectGroup,
  ResponsiveSelectLabel,
  ResponsiveSelectSeparator,
} from '~/common/components/responsive';

export default function TestMobileSelect() {
  const [theme, setTheme] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [notification, setNotification] = useState<string>('');
  const [privacy, setPrivacy] = useState<string>('');
  const [responsiveTheme, setResponsiveTheme] = useState<string>('');
  const [responsiveSize, setResponsiveSize] = useState<string>('');

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Mobile Select Component Test
          </h1>
          <p className="text-muted-foreground text-lg">
            Testing WCAG AAA compliant mobile-optimized Select components with
            haptic feedback
          </p>
        </div>

        {/* Section 1: Size Variants */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">1. Size Variants</h2>
            <p className="text-muted-foreground">
              All sizes meet WCAG 2.5.5 AAA minimum touch target requirements
              (44px+)
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Small (44px min)</label>
                <MobileSelect>
                  <MobileSelectTrigger size="sm">
                    <MobileSelectValue placeholder="Select theme..." />
                  </MobileSelectTrigger>
                  <MobileSelectContent size="sm">
                    <MobileSelectItem size="sm" value="light">
                      Light
                    </MobileSelectItem>
                    <MobileSelectItem size="sm" value="dark">
                      Dark
                    </MobileSelectItem>
                    <MobileSelectItem size="sm" value="system">
                      System
                    </MobileSelectItem>
                  </MobileSelectContent>
                </MobileSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Medium (48px min)</label>
                <MobileSelect>
                  <MobileSelectTrigger size="md">
                    <MobileSelectValue placeholder="Select theme..." />
                  </MobileSelectTrigger>
                  <MobileSelectContent size="md">
                    <MobileSelectItem size="md" value="light">
                      Light
                    </MobileSelectItem>
                    <MobileSelectItem size="md" value="dark">
                      Dark
                    </MobileSelectItem>
                    <MobileSelectItem size="md" value="system">
                      System
                    </MobileSelectItem>
                  </MobileSelectContent>
                </MobileSelect>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Large (56px min)</label>
                <MobileSelect>
                  <MobileSelectTrigger size="lg">
                    <MobileSelectValue placeholder="Select theme..." />
                  </MobileSelectTrigger>
                  <MobileSelectContent size="lg">
                    <MobileSelectItem size="lg" value="light">
                      Light
                    </MobileSelectItem>
                    <MobileSelectItem size="lg" value="dark">
                      Dark
                    </MobileSelectItem>
                    <MobileSelectItem size="lg" value="system">
                      System
                    </MobileSelectItem>
                  </MobileSelectContent>
                </MobileSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Extra Large (64px min)
                </label>
                <MobileSelect>
                  <MobileSelectTrigger size="xl">
                    <MobileSelectValue placeholder="Select theme..." />
                  </MobileSelectTrigger>
                  <MobileSelectContent size="xl">
                    <MobileSelectItem size="xl" value="light">
                      Light
                    </MobileSelectItem>
                    <MobileSelectItem size="xl" value="dark">
                      Dark
                    </MobileSelectItem>
                    <MobileSelectItem size="xl" value="system">
                      System
                    </MobileSelectItem>
                  </MobileSelectContent>
                </MobileSelect>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: State Variations */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">2. State Variations</h2>
            <p className="text-muted-foreground">
              Visual feedback for different states with clear color coding
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default State</label>
                <MobileSelect value={language} onValueChange={setLanguage}>
                  <MobileSelectTrigger state="default">
                    <MobileSelectValue placeholder="Select language..." />
                  </MobileSelectTrigger>
                  <MobileSelectContent>
                    <MobileSelectItem value="en">English</MobileSelectItem>
                    <MobileSelectItem value="ko">한국어</MobileSelectItem>
                    <MobileSelectItem value="ja">日本語</MobileSelectItem>
                    <MobileSelectItem value="zh">中文</MobileSelectItem>
                  </MobileSelectContent>
                </MobileSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Success State</label>
                <MobileSelect value={country} onValueChange={setCountry}>
                  <MobileSelectTrigger state="success">
                    <MobileSelectValue placeholder="Select country..." />
                  </MobileSelectTrigger>
                  <MobileSelectContent>
                    <MobileSelectItem value="us">
                      United States
                    </MobileSelectItem>
                    <MobileSelectItem value="kr">South Korea</MobileSelectItem>
                    <MobileSelectItem value="jp">Japan</MobileSelectItem>
                    <MobileSelectItem value="cn">China</MobileSelectItem>
                  </MobileSelectContent>
                </MobileSelect>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Warning State</label>
                <MobileSelect>
                  <MobileSelectTrigger state="warning">
                    <MobileSelectValue placeholder="Select notification..." />
                  </MobileSelectTrigger>
                  <MobileSelectContent>
                    <MobileSelectItem value="all">
                      All notifications
                    </MobileSelectItem>
                    <MobileSelectItem value="important">
                      Important only
                    </MobileSelectItem>
                    <MobileSelectItem value="none">None</MobileSelectItem>
                  </MobileSelectContent>
                </MobileSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Error State</label>
                <MobileSelect>
                  <MobileSelectTrigger state="error">
                    <MobileSelectValue placeholder="Select privacy..." />
                  </MobileSelectTrigger>
                  <MobileSelectContent>
                    <MobileSelectItem value="public">Public</MobileSelectItem>
                    <MobileSelectItem value="friends">
                      Friends only
                    </MobileSelectItem>
                    <MobileSelectItem value="private">Private</MobileSelectItem>
                  </MobileSelectContent>
                </MobileSelect>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Feedback Intensity */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">
              3. Touch Feedback Intensity
            </h2>
            <p className="text-muted-foreground">
              Different levels of haptic feedback and visual response
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subtle Feedback</label>
              <MobileSelect>
                <MobileSelectTrigger feedback="subtle" hapticIntensity="light">
                  <MobileSelectValue placeholder="Subtle..." />
                </MobileSelectTrigger>
                <MobileSelectContent>
                  <MobileSelectItem hapticIntensity="light" value="option1">
                    Option 1
                  </MobileSelectItem>
                  <MobileSelectItem hapticIntensity="light" value="option2">
                    Option 2
                  </MobileSelectItem>
                  <MobileSelectItem hapticIntensity="light" value="option3">
                    Option 3
                  </MobileSelectItem>
                </MobileSelectContent>
              </MobileSelect>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Medium Feedback</label>
              <MobileSelect>
                <MobileSelectTrigger feedback="medium" hapticIntensity="medium">
                  <MobileSelectValue placeholder="Medium..." />
                </MobileSelectTrigger>
                <MobileSelectContent>
                  <MobileSelectItem hapticIntensity="medium" value="option1">
                    Option 1
                  </MobileSelectItem>
                  <MobileSelectItem hapticIntensity="medium" value="option2">
                    Option 2
                  </MobileSelectItem>
                  <MobileSelectItem hapticIntensity="medium" value="option3">
                    Option 3
                  </MobileSelectItem>
                </MobileSelectContent>
              </MobileSelect>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Strong Feedback</label>
              <MobileSelect>
                <MobileSelectTrigger feedback="strong" hapticIntensity="heavy">
                  <MobileSelectValue placeholder="Strong..." />
                </MobileSelectTrigger>
                <MobileSelectContent>
                  <MobileSelectItem hapticIntensity="heavy" value="option1">
                    Option 1
                  </MobileSelectItem>
                  <MobileSelectItem hapticIntensity="heavy" value="option2">
                    Option 2
                  </MobileSelectItem>
                  <MobileSelectItem hapticIntensity="heavy" value="option3">
                    Option 3
                  </MobileSelectItem>
                </MobileSelectContent>
              </MobileSelect>
            </div>
          </div>
        </section>

        {/* Section 4: Grouped Options */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">
              4. Grouped Options with Icons
            </h2>
            <p className="text-muted-foreground">
              Organized options with visual separators and icons
            </p>
          </div>

          <div className="space-y-4">
            <MobileSelect>
              <MobileSelectTrigger size="lg">
                <SettingsIcon className="size-5" />
                <MobileSelectValue placeholder="Select settings category..." />
              </MobileSelectTrigger>
              <MobileSelectContent size="lg">
                <MobileSelectGroup>
                  <MobileSelectLabel size="lg">Appearance</MobileSelectLabel>
                  <MobileSelectItem size="lg" value="theme">
                    <PaletteIcon className="size-5" />
                    Theme Settings
                  </MobileSelectItem>
                  <MobileSelectItem size="lg" value="display">
                    <MonitorIcon className="size-5" />
                    Display Settings
                  </MobileSelectItem>
                </MobileSelectGroup>

                <MobileSelectSeparator size="lg" />

                <MobileSelectGroup>
                  <MobileSelectLabel size="lg">Communication</MobileSelectLabel>
                  <MobileSelectItem size="lg" value="notifications">
                    <BellIcon className="size-5" />
                    Notifications
                  </MobileSelectItem>
                  <MobileSelectItem size="lg" value="language">
                    <LanguagesIcon className="size-5" />
                    Language & Region
                  </MobileSelectItem>
                </MobileSelectGroup>

                <MobileSelectSeparator size="lg" />

                <MobileSelectGroup>
                  <MobileSelectLabel size="lg">Security</MobileSelectLabel>
                  <MobileSelectItem size="lg" value="privacy">
                    <ShieldCheckIcon className="size-5" />
                    Privacy Settings
                  </MobileSelectItem>
                  <MobileSelectItem size="lg" value="account">
                    <UserIcon className="size-5" />
                    Account Security
                  </MobileSelectItem>
                </MobileSelectGroup>
              </MobileSelectContent>
            </MobileSelect>
          </div>
        </section>

        {/* Section 5: ResponsiveSelect Auto-switching */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">
              5. ResponsiveSelect Auto-switching
            </h2>
            <p className="text-muted-foreground">
              Automatically switches between desktop and mobile variants at
              768px breakpoint
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Auto-responsive (Current:{' '}
                  {typeof window !== 'undefined' && window.innerWidth < 768
                    ? 'Mobile'
                    : 'Desktop'}
                  )
                </label>
                <ResponsiveSelect
                  value={responsiveTheme}
                  onValueChange={setResponsiveTheme}
                >
                  <ResponsiveSelectTrigger size="md">
                    <ResponsiveSelectValue placeholder="Select theme..." />
                  </ResponsiveSelectTrigger>
                  <ResponsiveSelectContent size="md">
                    <ResponsiveSelectItem size="md" value="light">
                      Light Theme
                    </ResponsiveSelectItem>
                    <ResponsiveSelectItem size="md" value="dark">
                      Dark Theme
                    </ResponsiveSelectItem>
                    <ResponsiveSelectItem size="md" value="system">
                      System Theme
                    </ResponsiveSelectItem>
                    <ResponsiveSelectItem size="md" value="auto">
                      Auto Theme
                    </ResponsiveSelectItem>
                  </ResponsiveSelectContent>
                </ResponsiveSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Force Mobile Variant
                </label>
                <ResponsiveSelect forceVariant="mobile">
                  <ResponsiveSelectTrigger forceVariant="mobile" size="lg">
                    <SmartphoneIcon className="size-5" />
                    <ResponsiveSelectValue placeholder="Mobile variant..." />
                  </ResponsiveSelectTrigger>
                  <ResponsiveSelectContent forceVariant="mobile" size="lg">
                    <ResponsiveSelectItem
                      forceVariant="mobile"
                      size="lg"
                      value="sm"
                    >
                      Small
                    </ResponsiveSelectItem>
                    <ResponsiveSelectItem
                      forceVariant="mobile"
                      size="lg"
                      value="md"
                    >
                      Medium
                    </ResponsiveSelectItem>
                    <ResponsiveSelectItem
                      forceVariant="mobile"
                      size="lg"
                      value="lg"
                    >
                      Large
                    </ResponsiveSelectItem>
                    <ResponsiveSelectItem
                      forceVariant="mobile"
                      size="lg"
                      value="xl"
                    >
                      Extra Large
                    </ResponsiveSelectItem>
                  </ResponsiveSelectContent>
                </ResponsiveSelect>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Force Desktop Variant
                </label>
                <ResponsiveSelect forceVariant="desktop">
                  <ResponsiveSelectTrigger forceVariant="desktop">
                    <MonitorIcon className="size-5" />
                    <ResponsiveSelectValue placeholder="Desktop variant..." />
                  </ResponsiveSelectTrigger>
                  <ResponsiveSelectContent forceVariant="desktop">
                    <ResponsiveSelectItem
                      forceVariant="desktop"
                      value="compact"
                    >
                      Compact
                    </ResponsiveSelectItem>
                    <ResponsiveSelectItem
                      forceVariant="desktop"
                      value="comfortable"
                    >
                      Comfortable
                    </ResponsiveSelectItem>
                    <ResponsiveSelectItem
                      forceVariant="desktop"
                      value="spacious"
                    >
                      Spacious
                    </ResponsiveSelectItem>
                  </ResponsiveSelectContent>
                </ResponsiveSelect>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Only</label>
                <ResponsiveSelect mobileOnly>
                  <ResponsiveSelectTrigger
                    mobileOnly
                    size="md"
                    feedback="medium"
                  >
                    <ResponsiveSelectValue placeholder="Mobile only..." />
                  </ResponsiveSelectTrigger>
                  <ResponsiveSelectContent mobileOnly size="md">
                    <ResponsiveSelectItem mobileOnly size="md" value="always">
                      Always Mobile
                    </ResponsiveSelectItem>
                    <ResponsiveSelectItem mobileOnly size="md" value="never">
                      Never Desktop
                    </ResponsiveSelectItem>
                    <ResponsiveSelectItem mobileOnly size="md" value="force">
                      Force Mobile
                    </ResponsiveSelectItem>
                  </ResponsiveSelectContent>
                </ResponsiveSelect>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Accessibility Features */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">
              6. Accessibility Features
            </h2>
            <p className="text-muted-foreground">
              WCAG AAA compliant with full keyboard navigation and screen reader
              support
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">Accessibility Test</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tab navigation: Use Tab/Shift+Tab to navigate</li>
                <li>• Keyboard activation: Press Enter or Space to open</li>
                <li>• Arrow navigation: Use Up/Down arrows in dropdown</li>
                <li>• Screen reader: All elements have proper ARIA labels</li>
                <li>• Touch targets: Minimum 44px for WCAG 2.5.5 AAA</li>
                <li>• Color contrast: Meets WCAG AA standards</li>
              </ul>

              <MobileSelect>
                <MobileSelectTrigger
                  size="lg"
                  aria-label="Accessibility test select"
                  aria-describedby="accessibility-help"
                >
                  <ShieldCheckIcon className="size-5" />
                  <MobileSelectValue placeholder="Test accessibility..." />
                </MobileSelectTrigger>
                <MobileSelectContent size="lg">
                  <MobileSelectItem size="lg" value="keyboard">
                    Keyboard Navigation ✓
                  </MobileSelectItem>
                  <MobileSelectItem size="lg" value="screen-reader">
                    Screen Reader ✓
                  </MobileSelectItem>
                  <MobileSelectItem size="lg" value="touch-target">
                    Touch Target ✓
                  </MobileSelectItem>
                  <MobileSelectItem size="lg" value="color-contrast">
                    Color Contrast ✓
                  </MobileSelectItem>
                  <MobileSelectItem size="lg" value="haptic">
                    Haptic Feedback ✓
                  </MobileSelectItem>
                </MobileSelectContent>
              </MobileSelect>

              <p
                id="accessibility-help"
                className="text-xs text-muted-foreground"
              >
                This select component meets WCAG 2.1 AAA accessibility standards
              </p>
            </div>
          </div>
        </section>

        {/* Section 7: Form Integration */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">7. Form Integration</h2>
            <p className="text-muted-foreground">
              Integration with form validation and submission
            </p>
          </div>

          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              alert(
                `Form submitted with values:\nTheme: ${theme}\nLanguage: ${language}\nCountry: ${country}`
              );
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="theme-select" className="text-sm font-medium">
                  Theme Preference *
                </label>
                <MobileSelect value={theme} onValueChange={setTheme} required>
                  <MobileSelectTrigger
                    id="theme-select"
                    state={theme ? 'success' : 'default'}
                    aria-required="true"
                  >
                    <PaletteIcon className="size-5" />
                    <MobileSelectValue placeholder="Choose theme..." />
                  </MobileSelectTrigger>
                  <MobileSelectContent>
                    <MobileSelectItem value="light">
                      Light Theme
                    </MobileSelectItem>
                    <MobileSelectItem value="dark">Dark Theme</MobileSelectItem>
                    <MobileSelectItem value="system">
                      System Theme
                    </MobileSelectItem>
                  </MobileSelectContent>
                </MobileSelect>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="language-select"
                  className="text-sm font-medium"
                >
                  Language
                </label>
                <MobileSelect value={language} onValueChange={setLanguage}>
                  <MobileSelectTrigger
                    id="language-select"
                    state={language ? 'success' : 'default'}
                  >
                    <GlobeIcon className="size-5" />
                    <MobileSelectValue placeholder="Choose language..." />
                  </MobileSelectTrigger>
                  <MobileSelectContent>
                    <MobileSelectItem value="en">English</MobileSelectItem>
                    <MobileSelectItem value="ko">한국어</MobileSelectItem>
                    <MobileSelectItem value="ja">日本語</MobileSelectItem>
                    <MobileSelectItem value="zh">中文</MobileSelectItem>
                  </MobileSelectContent>
                </MobileSelect>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors"
              disabled={!theme}
            >
              Submit Form
            </button>
          </form>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>
            Mobile Select Component Test • WCAG AAA Compliant • Haptic Feedback
            Enabled
          </p>
        </footer>
      </div>
    </div>
  );
}
