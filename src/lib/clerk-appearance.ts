/** Shared light-theme Clerk appearance matching 별빛 타로 UI */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#7c3aed",
    colorText: "#1e1b4b",
    colorTextSecondary: "#5b5675",
    colorBackground: "#faf8ff",
    colorInputBackground: "#ffffff",
    colorInputText: "#1e1b4b",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    rootBox: "mx-auto w-full",
    card: "shadow-lg border border-[var(--border)] !bg-[var(--surface)]",
    headerTitle: "!text-[var(--heading)]",
    headerSubtitle: "!text-[var(--body)]",
    socialButtonsBlockButton:
      "!border-[var(--border-strong)] hover:!border-[var(--accent-gold-bright)]",
    formButtonPrimary:
      "!bg-[var(--accent-violet-soft)] hover:!opacity-90 !shadow-none",
    footerActionLink: "!text-[var(--accent-violet-soft)]",
  },
};
