"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from "@simplewebauthn/browser";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";

import {
  GENERATE_PASSKEY_REGISTRATION_OPTIONS,
  VERIFY_PASSKEY_REGISTRATION,
  GENERATE_PASSKEY_AUTHENTICATION_OPTIONS,
  VERIFY_PASSKEY_AUTHENTICATION,
  MY_PASSKEYS,
  DELETE_PASSKEY,
  PasskeyCredential,
  AuthTokens,
} from "@/lib/graphql/auth";

interface UsePasskeyResult {
  // State
  isLoading: boolean;
  error: string | null;
  supportsPasskeys: boolean;
  hasPlatformAuthenticator: boolean;
  passkeys: PasskeyCredential[];
  passkeysLoading: boolean;

  // Actions
  registerPasskey: (email: string, friendlyName?: string) => Promise<boolean>;
  authenticateWithPasskey: (email?: string) => Promise<AuthTokens | null>;
  deletePasskey: (credentialId: string) => Promise<boolean>;
  refetchPasskeys: () => void;
  clearError: () => void;
}

export function usePasskey(): UsePasskeyResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportsPasskeys, setSupportsPasskeys] = useState(false);
  const [hasPlatformAuthenticator, setHasPlatformAuthenticator] =
    useState(false);

  // Check WebAuthn support on mount
  useEffect(() => {
    const checkSupport = async () => {
      const webAuthnSupported = browserSupportsWebAuthn();
      setSupportsPasskeys(webAuthnSupported);

      if (webAuthnSupported) {
        const platformAvailable = await platformAuthenticatorIsAvailable();
        setHasPlatformAuthenticator(platformAvailable);
      }
    };

    checkSupport();
  }, []);

  // GraphQL mutations with type annotations
  const [generateRegistrationOptions] = useMutation<{
    generatePasskeyRegistrationOptions: {
      options: PublicKeyCredentialCreationOptionsJSON;
    };
  }>(GENERATE_PASSKEY_REGISTRATION_OPTIONS);

  const [verifyRegistration] = useMutation<{
    verifyPasskeyRegistration: boolean;
  }>(VERIFY_PASSKEY_REGISTRATION);

  const [generateAuthenticationOptions] = useMutation<{
    generatePasskeyAuthenticationOptions: {
      options: PublicKeyCredentialRequestOptionsJSON;
      identifier: string;
    };
  }>(GENERATE_PASSKEY_AUTHENTICATION_OPTIONS);

  const [verifyAuthentication] = useMutation<{
    verifyPasskeyAuthentication: AuthTokens;
  }>(VERIFY_PASSKEY_AUTHENTICATION);

  const [deletePasskeyMutation] = useMutation<{ deletePasskey: boolean }>(
    DELETE_PASSKEY,
  );

  // Query for user's passkeys
  const {
    data: passkeysData,
    loading: passkeysLoading,
    refetch: refetchPasskeys,
  } = useQuery<{ myPasskeys: PasskeyCredential[] }>(MY_PASSKEYS, {
    skip: true, // Only fetch when explicitly requested
    fetchPolicy: "network-only",
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Register a new passkey for the user
   */
  const registerPasskey = useCallback(
    async (email: string, friendlyName?: string): Promise<boolean> => {
      if (!supportsPasskeys) {
        setError("Passkeys are not supported in this browser");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Get registration options from server
        const { data: optionsData } = await generateRegistrationOptions({
          variables: { email },
        });

        const options = optionsData?.generatePasskeyRegistrationOptions
          ?.options as PublicKeyCredentialCreationOptionsJSON;

        if (!options) {
          throw new Error("Failed to get registration options");
        }

        // Step 2: Create credential using WebAuthn API
        const registrationResponse = await startRegistration({
          optionsJSON: options,
        });

        // Step 3: Verify with server
        const { data: verifyData } = await verifyRegistration({
          variables: {
            email,
            response: registrationResponse,
            friendlyName,
          },
        });

        if (!verifyData?.verifyPasskeyRegistration) {
          throw new Error("Passkey registration failed");
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Passkey registration failed";

        // Handle specific WebAuthn errors
        if (message.includes("NotAllowedError")) {
          setError("Passkey registration was cancelled or not allowed");
        } else if (message.includes("InvalidStateError")) {
          setError("This passkey is already registered");
        } else {
          setError(message);
        }

        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [supportsPasskeys, generateRegistrationOptions, verifyRegistration],
  );

  /**
   * Authenticate using a passkey
   */
  const authenticateWithPasskey = useCallback(
    async (email?: string): Promise<AuthTokens | null> => {
      if (!supportsPasskeys) {
        setError("Passkeys are not supported in this browser");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Get authentication options from server
        const { data: optionsData } = await generateAuthenticationOptions({
          variables: { email },
        });

        const options = optionsData?.generatePasskeyAuthenticationOptions
          ?.options as PublicKeyCredentialRequestOptionsJSON;
        const identifier =
          optionsData?.generatePasskeyAuthenticationOptions?.identifier;

        if (!options || !identifier) {
          throw new Error("Failed to get authentication options");
        }

        // Step 2: Get credential from authenticator
        const authenticationResponse = await startAuthentication({
          optionsJSON: options,
        });

        // Step 3: Verify with server
        const { data: verifyData } = await verifyAuthentication({
          variables: {
            identifier,
            response: authenticationResponse,
          },
        });

        const tokens = verifyData?.verifyPasskeyAuthentication;

        if (!tokens) {
          throw new Error("Passkey authentication failed");
        }

        return tokens;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Passkey authentication failed";

        // Handle specific WebAuthn errors
        if (message.includes("NotAllowedError")) {
          setError("Passkey authentication was cancelled or not allowed");
        } else if (message.includes("No credentials")) {
          setError("No passkey found. Please use another sign-in method.");
        } else {
          setError(message);
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [supportsPasskeys, generateAuthenticationOptions, verifyAuthentication],
  );

  /**
   * Delete a passkey
   */
  const deletePasskey = useCallback(
    async (credentialId: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const { data } = await deletePasskeyMutation({
          variables: { credentialId },
        });

        if (!data?.deletePasskey) {
          throw new Error("Failed to delete passkey");
        }

        // Refresh passkeys list
        await refetchPasskeys();
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete passkey";
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [deletePasskeyMutation, refetchPasskeys],
  );

  return {
    isLoading,
    error,
    supportsPasskeys,
    hasPlatformAuthenticator,
    passkeys: passkeysData?.myPasskeys || [],
    passkeysLoading,
    registerPasskey,
    authenticateWithPasskey,
    deletePasskey,
    refetchPasskeys: () => refetchPasskeys(),
    clearError,
  };
}
