import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import SecurityPage from "@/app/settings/security/page";

describe("SecurityPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.confirm = jest.fn(() => true);
    globalThis.alert = jest.fn();
  });

  describe("rendering", () => {
    it("should render the page header", () => {
      render(<SecurityPage />);

      expect(screen.getByText("Security")).toBeInTheDocument();
      expect(
        screen.getByText("Manage your passkeys and active sessions"),
      ).toBeInTheDocument();
    });

    it("should render passkeys section", () => {
      render(<SecurityPage />);

      expect(screen.getByText("Passkeys")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Secure, passwordless login using biometrics or security keys",
        ),
      ).toBeInTheDocument();
    });

    it("should render Add Passkey button", () => {
      render(<SecurityPage />);

      expect(
        screen.getByRole("button", { name: "Add Passkey" }),
      ).toBeInTheDocument();
    });

    it("should render empty passkeys state", () => {
      render(<SecurityPage />);

      expect(screen.getByText("No passkeys added yet")).toBeInTheDocument();
      expect(
        screen.getByText("Add a passkey for faster, more secure sign-in"),
      ).toBeInTheDocument();
    });

    it("should render passkey benefits info", () => {
      render(<SecurityPage />);

      expect(screen.getByText("Why use passkeys?")).toBeInTheDocument();
      expect(
        screen.getByText("• Phishing-resistant - cannot be stolen or guessed"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("• No passwords to remember"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("• Use Face ID, Touch ID, or security keys"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("• Works across all your devices"),
      ).toBeInTheDocument();
    });

    it("should render active sessions section", () => {
      render(<SecurityPage />);

      expect(screen.getByText("Active Sessions")).toBeInTheDocument();
      expect(
        screen.getByText("Devices currently signed in to your account"),
      ).toBeInTheDocument();
    });

    it("should render current session with badge", () => {
      render(<SecurityPage />);

      expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
      expect(screen.getByText("Current")).toBeInTheDocument();
      expect(
        screen.getByText("Chrome 120 • San Francisco, CA"),
      ).toBeInTheDocument();
      expect(screen.getByText("Active now")).toBeInTheDocument();
    });

    it("should render sign out all button", () => {
      render(<SecurityPage />);

      expect(
        screen.getByText("Sign out all other devices"),
      ).toBeInTheDocument();
    });

    it("should render two-factor authentication section", () => {
      render(<SecurityPage />);

      expect(screen.getByText("Two-Factor Authentication")).toBeInTheDocument();
      expect(
        screen.getByText("Add an extra layer of security to your account"),
      ).toBeInTheDocument();
    });

    it("should render authenticator app option", () => {
      render(<SecurityPage />);

      expect(screen.getByText("Authenticator App")).toBeInTheDocument();
      expect(
        screen.getByText("Use an app like Google Authenticator or Authy"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Set Up" }),
      ).toBeInTheDocument();
    });

    it("should render recovery codes option", () => {
      render(<SecurityPage />);

      expect(screen.getByText("Recovery Codes")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Backup codes for when you cannot access your authenticator",
        ),
      ).toBeInTheDocument();
    });

    it("should render password section", () => {
      render(<SecurityPage />);

      expect(screen.getByText("Password")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Legacy password authentication (optional when using passkeys)",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Change Password")).toBeInTheDocument();
    });
  });

  describe("add passkey interaction", () => {
    it("should show alert when Add Passkey is clicked", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<SecurityPage />);

      await user.click(screen.getByRole("button", { name: "Add Passkey" }));

      // Fast-forward timers wrapped in act
      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(globalThis.alert).toHaveBeenCalledWith(
          "Passkey registration will be available once the backend implementation is complete.",
        );
      });

      jest.useRealTimers();
    });

    it("should show Adding... while registering", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<SecurityPage />);

      await user.click(screen.getByRole("button", { name: "Add Passkey" }));

      expect(
        screen.getByRole("button", { name: "Adding..." }),
      ).toBeInTheDocument();

      await act(async () => {
        jest.advanceTimersByTime(500);
      });
      jest.useRealTimers();
    });
  });

  describe("sign out all devices", () => {
    it("should show confirmation when clicked", async () => {
      const user = userEvent.setup();

      render(<SecurityPage />);

      await user.click(screen.getByText("Sign out all other devices"));

      expect(globalThis.confirm).toHaveBeenCalledWith(
        "Are you sure you want to sign out of all other devices?",
      );
    });

    it("should show alert for feature not available", async () => {
      const user = userEvent.setup();

      render(<SecurityPage />);

      await user.click(screen.getByText("Sign out all other devices"));

      await waitFor(() => {
        expect(globalThis.alert).toHaveBeenCalledWith(
          "This feature will be available soon.",
        );
      });
    });

    it("should not show alert when cancelled", async () => {
      const user = userEvent.setup();
      (globalThis.confirm as jest.Mock).mockReturnValueOnce(false);

      render(<SecurityPage />);

      await user.click(screen.getByText("Sign out all other devices"));

      expect(globalThis.alert).not.toHaveBeenCalled();
    });
  });

  describe("button states", () => {
    it("should have disabled Generate button for recovery codes", () => {
      render(<SecurityPage />);

      const generateButton = screen.getByRole("button", { name: "Generate" });
      expect(generateButton).toBeDisabled();
    });

    it("should have enabled Set Up button for authenticator", () => {
      render(<SecurityPage />);

      const setupButton = screen.getByRole("button", { name: "Set Up" });
      expect(setupButton).not.toBeDisabled();
    });

    it("should have enabled Change button for password", () => {
      render(<SecurityPage />);

      const changeButton = screen.getByRole("button", { name: "Change" });
      expect(changeButton).not.toBeDisabled();
    });
  });
});
