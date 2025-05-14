# Translation System Documentation

This project uses i18next for translations between Arabic and English. This document explains how to use the translation system.

## Basic Usage

```jsx
// Import the hook
import { useTranslationWithFallback } from '../hooks/useTranslationWithFallback';

function MyComponent() {
  // Get the translation function
  const { t } = useTranslationWithFallback();

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.welcome')}</p>
    </div>
  );
}
```

## Translation Files Structure

Translation files are stored in the `public/locales` directory:

```
/public/locales/
  ├── en/
  │   └── translation.json
  └── ar/
      └── translation.json
```

If you need to add translations for specific features, you can add more namespace files:

```
/public/locales/
  ├── en/
  │   ├── translation.json
  │   ├── home.json
  │   └── auth.json
  └── ar/
      ├── translation.json
      ├── home.json
      └── auth.json
```

## Handling Missing Translations

When a translation is missing, the system will:

1. In development: Show a warning in the console and display a highlighted message indicating the missing translation
2. In production: Fall back to the English version or the key itself

You can explicitly display a missing translation indicator using the `MissingTranslation` component:

```jsx
import MissingTranslation from '../components/MissingTranslation';

// When you know a translation is missing and want to mark it
<MissingTranslation translationKey="some.future.key" fallback="Default text" />;
```

## Language Toggle

The language toggle component can be used to switch between languages:

```jsx
import LanguageToggle from '../components/LanguageToggle';

function Header() {
  return (
    <header>
      <LanguageToggle />
    </header>
  );
}
```

## Adding New Translations

1. Identify the translation key needed, following the nested structure (e.g., `forms.child.title`)
2. Add the translation to both `en/translation.json` and `ar/translation.json` files
3. Use the translation in your component with the `t` function

## RTL Support

Arabic language content is automatically displayed in Right-to-Left (RTL) mode when the language is set to Arabic. The RTL support is handled by:

1. Setting the `dir="rtl"` attribute on the HTML element
2. Applying RTL-specific CSS from `src/styles/rtl.css`
3. Automatically flipping layout elements as needed

## Translation Context

The application provides a Translation Context that makes the translation function and language information available throughout the entire app:

```jsx
// In a component
import { useTranslation } from '../contexts/TranslationContext';

function MyComponent() {
  const { t, language, isRTL, changeLanguage } = useTranslation();

  return (
    <div>
      <p>{t('some.key')}</p>
      <p>Current language: {language}</p>
      <p>Is RTL: {isRTL ? 'Yes' : 'No'}</p>
      <button onClick={() => changeLanguage('ar')}>Switch to Arabic</button>
    </div>
  );
}
```

## Tips for Translators

When adding new translations:

1. Maintain the same hierarchical structure in both language files
2. Keep translation keys descriptive and organized by feature
3. Use placeholders for dynamic content: `"welcome": "Hello {{name}}!"`
4. Add comments for translators when context is important
