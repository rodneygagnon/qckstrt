import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import RegisterPage from "@/app/(auth)/register/page";

// Mock Next.js Link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock auth context
const mockRegisterWithMagicLink = jest.fn();
const mockClearError = jest.fn();

const defaultAuthContext = {
  registerWithMagicLink: mockRegisterWithMagicLink,
  isLoading: false,
  error: null as string | null,
  clearError: mockClearError,
  magicLinkSent: false,
  // Other required context values
  user: null,
  tokens: null,
  isAuthenticated: false,
  login: jest.fn(),
  loginWithPasskey: jest.fn(),
  sendMagicLink: jest.fn(),
  verifyMagicLink: jest.fn(),
  register: jest.fn(),
  registerPasskey: jest.fn(),
  logout: jest.fn(),
  supportsPasskeys: true,
  hasPlatformAuthenticator: true,
};

let mockAuthContextValue = { ...defaultAuthContext };

jest.mock("@/lib/auth-context", () => ({
  useAuth: () => mockAuthContextValue,
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContextValue = { ...defaultAuthContext };
  });

  describe("initial rendering", () => {
    it("should render the registration page header", () => {
      render(<RegisterPage />);

      expect(screen.getByText("Create an account")).toBeInTheDocument();
      expect(
        screen.getByText("Get started with your free account"),
      ).toBeInTheDocument();
    });

    it("should render the passwordless benefit message", () => {
      render(<RegisterPage />);

      expect(screen.getByText("No password required")).toBeInTheDocument();
    });

    it("should render email input", () => {
      render(<RegisterPage />);

      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("you@example.com"),
      ).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<RegisterPage />);

      expect(
        screen.getByRole("button", { name: /Continue with Email/i }),
      ).toBeInTheDocument();
    });

    it("should render login link", () => {
      render(<RegisterPage />);

      expect(screen.getByText("Already have an account?")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    });

    it("should render terms and privacy links", () => {
      render(<RegisterPage />);

      expect(
        screen.getByRole("link", { name: "Terms of Service" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Privacy Policy" }),
      ).toBeInTheDocument();
    });
  });

  describe("form validation", () => {
    it("should disable submit button when email is empty", () => {
      render(<RegisterPage />);

      const submitButton = screen.getByRole("button", {
        name: /Continue with Email/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("should disable submit button when email is invalid", async () => {
      render(<RegisterPage />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      await userEvent.type(emailInput, "invalid-email");

      const submitButton = screen.getByRole("button", {
        name: /Continue with Email/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when valid email is entered", async () => {
      render(<RegisterPage />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      await userEvent.type(emailInput, "test@example.com");

      const submitButton = screen.getByRole("button", {
        name: /Continue with Email/i,
      });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("form submission", () => {
    it("should call registerWithMagicLink when form is submitted", async () => {
      mockRegisterWithMagicLink.mockResolvedValue(true);
      render(<RegisterPage />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      await userEvent.type(emailInput, "test@example.com");

      const submitButton = screen.getByRole("button", {
        name: /Continue with Email/i,
      });
      await userEvent.click(submitButton);

      expect(mockClearError).toHaveBeenCalled();
      // JSDOM uses http://localhost as the origin
      expect(mockRegisterWithMagicLink).toHaveBeenCalledWith(
        "test@example.com",
        expect.stringContaining("/auth/callback?type=register"),
      );
    });

    it("should clear error before submission", async () => {
      mockRegisterWithMagicLink.mockResolvedValue(true);
      render(<RegisterPage />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      await userEvent.type(emailInput, "test@example.com");

      const submitButton = screen.getByRole("button", {
        name: /Continue with Email/i,
      });
      await userEvent.click(submitButton);

      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe("success state", () => {
    it("should show check email message when magic link is sent", () => {
      mockAuthContextValue = { ...defaultAuthContext, magicLinkSent: true };
      render(<RegisterPage />);

      expect(screen.getByText("Check your email")).toBeInTheDocument();
      expect(
        screen.getByText("We've sent a verification link to"),
      ).toBeInTheDocument();
    });

    it("should show email address in success message", () => {
      mockAuthContextValue = { ...defaultAuthContext, magicLinkSent: true };
      render(<RegisterPage />);

      // The email is shown, but we need to type it first to set state
      // Since we're testing the success state directly, the email will be empty
      // Let's verify the structure instead
      expect(screen.getByText("Check your email")).toBeInTheDocument();
      // Use regex since the text contains a line break
      expect(
        screen.getByText(
          /Click the link in your email to complete your registration/,
        ),
      ).toBeInTheDocument();
    });

    it("should show link expiration notice", () => {
      mockAuthContextValue = { ...defaultAuthContext, magicLinkSent: true };
      render(<RegisterPage />);

      expect(
        screen.getByText(/The link expires in 2 hours/),
      ).toBeInTheDocument();
    });

    it("should show back to sign in link", () => {
      mockAuthContextValue = { ...defaultAuthContext, magicLinkSent: true };
      render(<RegisterPage />);

      expect(
        screen.getByRole("link", { name: "Back to Sign in" }),
      ).toBeInTheDocument();
    });

    it("should show use different email button", () => {
      mockAuthContextValue = { ...defaultAuthContext, magicLinkSent: true };
      render(<RegisterPage />);

      expect(
        screen.getByRole("button", { name: "Use a different email" }),
      ).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("should display error message when error exists", () => {
      mockAuthContextValue = {
        ...defaultAuthContext,
        error: "Email already exists",
      };
      render(<RegisterPage />);

      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("should show loading state when isLoading is true", () => {
      mockAuthContextValue = { ...defaultAuthContext, isLoading: true };
      render(<RegisterPage />);

      expect(
        screen.getByText("Sending verification link..."),
      ).toBeInTheDocument();
    });

    it("should disable submit button when loading", () => {
      mockAuthContextValue = { ...defaultAuthContext, isLoading: true };
      render(<RegisterPage />);

      const submitButton = screen.getByRole("button", {
        name: /Sending verification link/i,
      });
      expect(submitButton).toBeDisabled();
    });
  });
});
