import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { I18nProvider, I18nToggle, useI18n } from "./i18n-provider";
import { ThemeProvider } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

function TranslationProbe() {
  const { t } = useI18n();
  return <p>{t("home")}</p>;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.lang = "vi";
});
afterEach(cleanup);

describe("global preference controls", () => {
  it("switches the UI language, document language and saved preference", () => {
    render(<I18nProvider><I18nToggle /><TranslationProbe /></I18nProvider>);

    fireEvent.click(screen.getByRole("button", { name: "Chuyển ngôn ngữ sang English" }));

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("EN");
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("nacentwin_lang")).toBe("en");
  });

  it("switches dark mode and saves the selected theme", () => {
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);

    fireEvent.click(screen.getByRole("button", { name: "Chuyển sang chế độ tối" }));

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("nacentwin_theme")).toBe("dark");
  });
});
