import { render, RenderOptions } from "@testing-library/react";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { ReactElement } from "react";
import { I18nProvider } from "@/lib/i18n/context";

// Extend Jest matchers with axe accessibility matchers
expect.extend(toHaveNoViolations);

// Configure axe with WCAG 2.2 AA rules
export const axe = configureAxe({
  rules: {
    // WCAG 2.2 AA rules
    "color-contrast": { enabled: true },
    "image-alt": { enabled: true },
    label: { enabled: true },
    "link-name": { enabled: true },
    "button-name": { enabled: true },
    "html-has-lang": { enabled: true },
    "html-lang-valid": { enabled: true },
    "valid-lang": { enabled: true },
    "aria-allowed-attr": { enabled: true },
    "aria-hidden-body": { enabled: true },
    "aria-hidden-focus": { enabled: true },
    "aria-required-attr": { enabled: true },
    "aria-required-children": { enabled: true },
    "aria-required-parent": { enabled: true },
    "aria-valid-attr-value": { enabled: true },
    "aria-valid-attr": { enabled: true },
    "heading-order": { enabled: true },
    "duplicate-id": { enabled: true },
    "landmark-one-main": { enabled: true },
    // Disable rules that may conflict with test environment
    region: { enabled: false }, // Components tested in isolation don't have landmarks
  },
});

// Wrapper for rendering with i18n provider
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return <I18nProvider>{children}</I18nProvider>;
};

// Custom render that includes all providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

// Helper to run axe and return results
export const checkA11y = async (container: HTMLElement) => {
  const results = await axe(container);
  return results;
};

// Re-export everything from testing-library
export * from "@testing-library/react";
export { axe, toHaveNoViolations };
