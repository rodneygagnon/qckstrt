"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth-context";
import { usePasskey } from "@/lib/hooks/usePasskey";

interface Session {
  id: string;
  deviceType: string;
  deviceName: string;
  browser: string;
  location: string;
  lastActivity: string;
  isCurrent: boolean;
}

const mockSessions: Session[] = [
  {
    id: "1",
    deviceType: "desktop",
    deviceName: "MacBook Pro",
    browser: "Chrome 120",
    location: "San Francisco, CA",
    lastActivity: "Active now",
    isCurrent: true,
  },
];

function PasskeyIcon() {
  return (
    <svg
      className="w-8 h-8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
      />
    </svg>
  );
}

function DeviceIcon({ type }: Readonly<{ type: string }>) {
  if (type === "mobile") {
    return (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    );
  }
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export default function SecurityPage() {
  const { t } = useTranslation("settings");
  const { user } = useAuth();
  const {
    passkeys,
    passkeysLoading,
    isLoading: passkeyActionLoading,
    error: passkeyError,
    supportsPasskeys,
    registerPasskey,
    deletePasskey,
    refetchPasskeys,
    clearError,
  } = usePasskey();

  const [sessions] = useState<Session[]>(mockSessions);
  const [showAddModal, setShowAddModal] = useState(false);
  const [friendlyName, setFriendlyName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch passkeys on mount
  useEffect(() => {
    if (user) {
      refetchPasskeys();
    }
  }, [user, refetchPasskeys]);

  const handleAddPasskey = async () => {
    if (!user?.email) return;

    clearError();
    const success = await registerPasskey(
      user.email,
      friendlyName || undefined,
    );

    if (success) {
      setShowAddModal(false);
      setFriendlyName("");
      refetchPasskeys();
    }
  };

  const handleDeletePasskey = async (credentialId: string) => {
    const success = await deletePasskey(credentialId);
    if (success) {
      setDeleteConfirmId(null);
    }
  };

  const handleRevokeSession = async (_sessionId: string) => {
    if (!confirm(t("security.sessions.revokeConfirm"))) return;
    // TODO: Implement session revocation
    alert(t("security.sessions.revokePending"));
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm(t("security.sessions.revokeAllConfirm"))) return;
    // TODO: Implement revoke all sessions
    alert(t("security.sessions.revokeAllPending"));
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Passkeys Section */}
      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1e293b]">
              {t("security.title")}
            </h1>
            <p className="text-[#64748b] mt-1">{t("security.subtitle")}</p>
          </div>
        </div>

        {/* Passkeys */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1e293b]">
                {t("security.passkeys.title")}
              </h2>
              <p className="text-sm text-[#64748b]">
                {t("security.passkeys.description")}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={!supportsPasskeys || passkeyActionLoading}
              className="px-4 py-2 bg-[#1e293b] text-white rounded-lg font-medium hover:bg-[#334155] transition-colors disabled:opacity-50"
            >
              {t("security.passkeys.addButton")}
            </button>
          </div>

          {/* Error display */}
          {passkeyError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {passkeyError}
            </div>
          )}

          {/* Not supported warning */}
          {!supportsPasskeys && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              {t("security.passkeys.notSupported")}
            </div>
          )}

          {passkeysLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-[#1e293b] border-t-transparent rounded-full mx-auto" />
              <p className="text-[#64748b] mt-2">
                {t("common:status.loading")}
              </p>
            </div>
          ) : passkeys.length > 0 ? (
            <div className="space-y-3">
              {passkeys.map((passkey) => (
                <div
                  key={passkey.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg text-[#64748b]">
                      <PasskeyIcon />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e293b]">
                        {passkey.friendlyName || t("security.passkeys.unnamed")}
                      </p>
                      <p className="text-sm text-[#64748b]">
                        {passkey.deviceType ||
                          t("security.passkeys.unknownDevice")}{" "}
                        • {t("security.passkeys.created")}:{" "}
                        {formatDate(passkey.createdAt)}
                      </p>
                      {passkey.lastUsedAt && (
                        <p className="text-xs text-[#94a3b8]">
                          {t("security.passkeys.lastUsed")}:{" "}
                          {formatDate(passkey.lastUsedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  {deleteConfirmId === passkey.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeletePasskey(passkey.id)}
                        disabled={passkeyActionLoading}
                        className="text-sm text-red-600 font-medium hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        {t("common:buttons.confirm")}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-sm text-[#64748b] hover:text-[#1e293b] transition-colors"
                      >
                        {t("common:buttons.cancel")}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(passkey.id)}
                      className="text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      {t("common:buttons.remove")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <div className="text-[#64748b] mb-4">
                <svg
                  className="w-12 h-12 mx-auto opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  />
                </svg>
              </div>
              <p className="text-[#1e293b] font-medium">
                {t("security.passkeys.empty")}
              </p>
              <p className="text-sm text-[#64748b] mt-1">
                {t("security.passkeys.emptyHint")}
              </p>
            </div>
          )}

          {/* Passkey Benefits */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {t("security.passkeys.whyTitle")}
                </p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• {t("security.passkeys.benefit1")}</li>
                  <li>• {t("security.passkeys.benefit2")}</li>
                  <li>• {t("security.passkeys.benefit3")}</li>
                  <li>• {t("security.passkeys.benefit4")}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1e293b]">
                {t("security.sessions.title")}
              </h2>
              <p className="text-sm text-[#64748b]">
                {t("security.sessions.description")}
              </p>
            </div>
            <button
              onClick={handleRevokeAllSessions}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              {t("security.sessions.signOutAll")}
            </button>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  session.isCurrent
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      session.isCurrent
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-[#64748b]"
                    }`}
                  >
                    <DeviceIcon type={session.deviceType} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#1e293b]">
                        {session.deviceName}
                      </p>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">
                          {t("common:status.current")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#64748b]">
                      {session.browser} • {session.location}
                    </p>
                    <p className="text-xs text-[#94a3b8]">
                      {session.lastActivity}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    {t("security.sessions.revoke")}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-2">
          {t("security.twoFactor.title")}
        </h2>
        <p className="text-[#64748b] text-sm mb-6">
          {t("security.twoFactor.description")}
        </p>

        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg text-[#64748b]">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#1e293b]">
                {t("security.twoFactor.authenticator.title")}
              </p>
              <p className="text-sm text-[#64748b]">
                {t("security.twoFactor.authenticator.description")}
              </p>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium border border-gray-200 text-[#1e293b] rounded-lg hover:bg-gray-50 transition-colors">
            {t("security.twoFactor.authenticator.setupButton")}
          </button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-100 rounded-lg text-[#64748b]">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#1e293b]">
                {t("security.twoFactor.recovery.title")}
              </p>
              <p className="text-sm text-[#64748b]">
                {t("security.twoFactor.recovery.description")}
              </p>
            </div>
          </div>
          <button
            disabled
            className="px-4 py-2 text-sm font-medium border border-gray-200 text-gray-400 rounded-lg cursor-not-allowed"
          >
            {t("security.twoFactor.recovery.generateButton")}
          </button>
        </div>
      </div>

      {/* Password Section (Legacy) */}
      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8">
        <h2 className="text-lg font-semibold text-[#1e293b] mb-2">
          {t("security.password.title")}
        </h2>
        <p className="text-[#64748b] text-sm mb-6">
          {t("security.password.description")}
        </p>

        <div className="flex items-center justify-between py-4">
          <div>
            <p className="font-medium text-[#1e293b]">
              {t("security.password.changeTitle")}
            </p>
            <p className="text-sm text-[#64748b]">
              {t("security.password.changeDescription")}
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium border border-gray-200 text-[#1e293b] rounded-lg hover:bg-gray-50 transition-colors">
            {t("security.password.changeButton")}
          </button>
        </div>
      </div>

      {/* Add Passkey Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-semibold text-[#1e293b] mb-2">
              {t("security.passkeys.addTitle")}
            </h3>
            <p className="text-[#64748b] text-sm mb-6">
              {t("security.passkeys.addDescription")}
            </p>

            <div className="mb-6">
              <label
                htmlFor="friendlyName"
                className="block text-sm font-medium text-[#1e293b] mb-2"
              >
                {t("security.passkeys.friendlyNameLabel")}
              </label>
              <input
                id="friendlyName"
                type="text"
                value={friendlyName}
                onChange={(e) => setFriendlyName(e.target.value)}
                placeholder={t("security.passkeys.friendlyNamePlaceholder")}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e293b] focus:border-transparent"
              />
              <p className="text-xs text-[#64748b] mt-1">
                {t("security.passkeys.friendlyNameHint")}
              </p>
            </div>

            {passkeyError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {passkeyError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFriendlyName("");
                  clearError();
                }}
                disabled={passkeyActionLoading}
                className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#1e293b] transition-colors"
              >
                {t("common:buttons.cancel")}
              </button>
              <button
                onClick={handleAddPasskey}
                disabled={passkeyActionLoading}
                className="px-4 py-2 bg-[#1e293b] text-white rounded-lg font-medium hover:bg-[#334155] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {passkeyActionLoading && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                )}
                {passkeyActionLoading
                  ? t("security.passkeys.adding")
                  : t("security.passkeys.addButton")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
