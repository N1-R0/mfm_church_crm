import { Head, useForm } from "@inertiajs/react";
import { FormEvent, useState } from "react";

type Props = {
  email: string;
  role: string;
};

export default function InvitationAccept({ email, role }: Props) {
  const form = useForm({
    name: "",
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();

    form.post(window.location.pathname);
  }

  const formattedRole =
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  return (
    <>
      <Head title="Accept invitation" />

      <main className="invite-page">
        <div className="invite-background-glow invite-background-glow--top" />
        <div className="invite-background-glow invite-background-glow--bottom" />

        <section className="invite-shell">
          <div className="invite-brand">
            <div className="invite-logo-wrap">
              <img
                src="/images/mfm-youth-logo.png"
                alt="MFM Youth Church logo"
                className="invite-logo"
              />
            </div>

            <div>
              <div className="invite-brand-name">MFM Youth Church CRM</div>
              <div className="invite-brand-location">Ogba Youth Church</div>
            </div>
          </div>

          <div className="invite-card">
            <div className="invite-card-accent" />

            <div className="invite-header">
              <div className="invite-status-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 14.5a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M4.5 21c.55-3.2 3.52-5.5 7.5-5.5s6.95 2.3 7.5 5.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                  <path
                    d="m17.6 9.7 1.25 1.25 2.3-2.55"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div>
                <p className="invite-eyebrow">YOU'RE INVITED</p>
                <h1>Complete your account</h1>
                <p className="invite-intro">
                  Welcome to MFM Youth Church CRM. Create your password to
                  finish setting up your account.
                </p>
              </div>
            </div>

            <div className="invite-details">
              <div className="invite-detail">
                <span className="invite-detail-label">Email address</span>
                <strong>{email}</strong>
              </div>

              <div className="invite-detail">
                <span className="invite-detail-label">Assigned role</span>
                <span className="invite-role">{formattedRole}</span>
              </div>
            </div>

            <form onSubmit={submit} className="invite-form">
              <div className="invite-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.data.name}
                  onChange={(e) => form.setData("name", e.target.value)}
                  required
                  autoFocus
                  aria-invalid={form.errors.name ? "true" : undefined}
                />

                {form.errors.name && (
                  <p className="invite-error">{form.errors.name}</p>
                )}
              </div>

              <div className="invite-field">
                <label htmlFor="password">Password</label>

                <div className="invite-password-wrap">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a secure password"
                    value={form.data.password}
                    onChange={(e) => form.setData("password", e.target.value)}
                    required
                    aria-invalid={form.errors.password ? "true" : undefined}
                  />

                  <button
                    type="button"
                    className="invite-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="invite-hint">
                  Use the password requirements configured for your MFM Youth
                  Church CRM account.
                </p>

                {form.errors.password && (
                  <p className="invite-error">{form.errors.password}</p>
                )}
              </div>

              <div className="invite-field">
                <label htmlFor="password_confirmation">Confirm password</label>

                <div className="invite-password-wrap">
                  <input
                    id="password_confirmation"
                    type={showConfirmation ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    value={form.data.password_confirmation}
                    onChange={(e) =>
                      form.setData("password_confirmation", e.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    className="invite-password-toggle"
                    onClick={() => setShowConfirmation((value) => !value)}
                    aria-label={
                      showConfirmation
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                  >
                    {showConfirmation ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="invite-security">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3 5.5 5.8v5.65c0 4.15 2.75 7.65 6.5 9.05 3.75-1.4 6.5-4.9 6.5-9.05V5.8L12 3Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="m9.3 11.75 1.75 1.75 3.75-4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <p>
                  Your email and assigned role come from your secure invitation
                  and cannot be changed during account setup.
                </p>
              </div>

              <button
                type="submit"
                disabled={form.processing}
                className="invite-submit"
              >
                {form.processing ? "Creating account..." : "Create account"}
              </button>
            </form>
          </div>

          <p className="invite-footer">
            MFM Youth Church CRM · Ogba Youth Church
          </p>
        </section>
      </main>

      <style>{`
                :root {
                    --invite-primary: var(--brand-primary);
                    --invite-primary-hover: var(--brand-primary-hover);
                    --invite-secondary: var(--brand-secondary);
                    --invite-dark: var(--brand-secondary-hover);
                    --invite-bg: var(--brand-bg);
                    --invite-surface: var(--brand-surface);
                    --invite-border: var(--brand-border);
                    --invite-text: var(--brand-text);
                    --invite-muted: var(--brand-text-muted);
                    --invite-soft: var(--brand-primary-soft);
                    --invite-danger: var(--brand-danger);
                }

                * {
                    box-sizing: border-box;
                }

                .invite-page {
                    min-height: 100vh;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 48px 20px;
                    background:
                        radial-gradient(
                            circle at 20% 0%,
                            var(--brand-focus),
                            transparent 35%
                        ),
                        linear-gradient(
                            145deg,
                            var(--invite-bg) 0%,
                            var(--invite-bg) 58%,
                            var(--brand-surface-muted) 100%
                        );
                    color: var(--invite-text);
                }

                .invite-background-glow {
                    position: absolute;
                    border-radius: 999px;
                    pointer-events: none;
                }

                .invite-background-glow--top {
                    width: 360px;
                    height: 360px;
                    top: -200px;
                    right: -100px;
                    border: 1px solid var(--brand-focus);
                }

                .invite-background-glow--bottom {
                    width: 280px;
                    height: 280px;
                    bottom: -175px;
                    left: -90px;
                    background: color-mix(in srgb, var(--brand-secondary) 4%, transparent);
                }

                .invite-shell {
                    width: min(100%, 570px);
                    position: relative;
                    z-index: 1;
                }

                .invite-brand {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 22px;
                }

                .invite-logo-wrap {
                    width: 54px;
                    height: 54px;
                    display: grid;
                    place-items: center;
                    border-radius: 16px;
                    background: #fff;
                    border: 1px solid var(--invite-border);
                    box-shadow: 0 8px 28px rgba(104, 20, 59, 0.08);
                    overflow: hidden;
                }

                .invite-logo {
                    width: 46px;
                    height: 46px;
                    object-fit: contain;
                }

                .invite-brand-name {
                    color: var(--invite-secondary);
                    font-weight: 800;
                    font-size: 16px;
                    line-height: 1.2;
                }

                .invite-brand-location {
                    margin-top: 3px;
                    color: var(--invite-muted);
                    font-size: 12px;
                    font-weight: 600;
                }

                .invite-card {
                    position: relative;
                    overflow: hidden;
                    background: var(--invite-surface);
                    border: 1px solid var(--invite-border);
                    border-radius: 24px;
                    padding: 36px;
                    box-shadow:
                        0 24px 70px rgba(67, 21, 42, 0.11),
                        0 2px 6px rgba(67, 21, 42, 0.04);
                }

                .invite-card-accent {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 5px;
                    background: linear-gradient(
                        90deg,
                        var(--invite-secondary),
                        var(--invite-primary)
                    );
                }

                .invite-header {
                    display: grid;
                    grid-template-columns: 48px minmax(0, 1fr);
                    gap: 16px;
                    align-items: start;
                }

                .invite-status-icon {
                    width: 48px;
                    height: 48px;
                    display: grid;
                    place-items: center;
                    border-radius: 15px;
                    background: var(--invite-soft);
                    color: var(--invite-primary);
                }

                .invite-status-icon svg {
                    width: 25px;
                    height: 25px;
                }

                .invite-eyebrow {
                    margin: 0 0 5px;
                    color: var(--invite-primary);
                    font-size: 11px;
                    font-weight: 850;
                    letter-spacing: 0.12em;
                }

                .invite-header h1 {
                    margin: 0;
                    color: var(--invite-dark);
                    font-size: clamp(26px, 5vw, 35px);
                    line-height: 1.13;
                    letter-spacing: -0.035em;
                }

                .invite-intro {
                    margin: 10px 0 0;
                    color: var(--invite-muted);
                    line-height: 1.65;
                    font-size: 14px;
                }

                .invite-details {
                    margin: 28px 0;
                    display: grid;
                    grid-template-columns: minmax(0, 1.5fr) minmax(140px, .7fr);
                    border: 1px solid var(--invite-border);
                    border-radius: 15px;
                    overflow: hidden;
                    background: var(--invite-bg);
                }

                .invite-detail {
                    padding: 14px 16px;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .invite-detail + .invite-detail {
                    border-left: 1px solid var(--invite-border);
                }

                .invite-detail-label {
                    color: var(--invite-muted);
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: .075em;
                }

                .invite-detail strong {
                    overflow-wrap: anywhere;
                    color: var(--invite-text);
                    font-size: 13px;
                }

                .invite-role {
                    width: fit-content;
                    padding: 4px 9px;
                    border-radius: 999px;
                    background: var(--invite-soft);
                    color: var(--invite-secondary);
                    font-size: 12px;
                    font-weight: 800;
                }

                .invite-form {
                    display: grid;
                    gap: 19px;
                }

                .invite-field {
                    min-width: 0;
                }

                .invite-field label {
                    display: block;
                    margin-bottom: 7px;
                    color: var(--invite-text);
                    font-size: 13px;
                    font-weight: 750;
                }

                .invite-field input {
                    width: 100%;
                    height: 48px;
                    border: 1px solid var(--invite-border);
                    border-radius: 12px;
                    padding: 0 14px;
                    outline: none;
                    background: #fff;
                    color: var(--invite-text);
                    font: inherit;
                    font-size: 14px;
                    transition:
                        border-color 160ms ease,
                        box-shadow 160ms ease,
                        background 160ms ease;
                }

                .invite-field input::placeholder {
                    color: var(--invite-muted);
                }

                .invite-field input:hover {
                    border-color: var(--invite-secondary);
                }

                .invite-field input:focus {
                    border-color: var(--invite-primary);
                    box-shadow: 0 0 0 4px var(--brand-focus);
                }

                .invite-field input[aria-invalid="true"] {
                    border-color: var(--invite-danger);
                }

                .invite-password-wrap {
                    position: relative;
                }

                .invite-password-wrap input {
                    padding-right: 65px;
                }

                .invite-password-toggle {
                    position: absolute;
                    right: 5px;
                    top: 5px;
                    bottom: 5px;
                    border: 0;
                    border-radius: 8px;
                    padding: 0 10px;
                    background: transparent;
                    color: var(--invite-secondary);
                    font-size: 11px;
                    font-weight: 800;
                    cursor: pointer;
                }

                .invite-password-toggle:hover {
                    background: var(--invite-soft);
                }

                .invite-password-toggle:focus-visible,
                .invite-submit:focus-visible {
                    outline: 3px solid var(--brand-focus);
                    outline-offset: 2px;
                }

                .invite-hint {
                    margin: 6px 0 0;
                    color: var(--invite-muted);
                    font-size: 11px;
                    line-height: 1.45;
                }

                .invite-error {
                    margin: 6px 0 0;
                    color: var(--invite-danger);
                    font-size: 12px;
                    font-weight: 650;
                }

                .invite-security {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    padding: 13px 14px;
                    border-radius: 12px;
                    background: var(--invite-soft);
                    color: var(--invite-secondary);
                }

                .invite-security svg {
                    width: 19px;
                    height: 19px;
                    margin-top: 1px;
                    flex: none;
                }

                .invite-security p {
                    margin: 0;
                    color: var(--invite-muted);
                    font-size: 11px;
                    line-height: 1.55;
                }

                .invite-submit {
                    min-height: 50px;
                    border: 0;
                    border-radius: 12px;
                    padding: 0 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(
                        135deg,
                        var(--invite-primary),
                        var(--invite-primary-hover)
                    );
                    color: #fff;
                    font: inherit;
                    font-size: 14px;
                    font-weight: 850;
                    cursor: pointer;
                    box-shadow: 0 10px 25px var(--brand-focus);
                    transition:
                        transform 150ms ease,
                        box-shadow 150ms ease,
                        opacity 150ms ease;
                }

                .invite-submit:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 13px 30px var(--brand-focus);
                }

                .invite-submit:disabled {
                    cursor: wait;
                    opacity: .65;
                }

                .invite-footer {
                    margin: 18px 0 0;
                    text-align: center;
                    color: var(--invite-muted);
                    font-size: 11px;
                    font-weight: 600;
                }

                @media (max-width: 600px) {
                    .invite-page {
                        align-items: flex-start;
                        padding: 25px 14px;
                    }

                    .invite-card {
                        padding: 26px 20px;
                        border-radius: 20px;
                    }

                    .invite-header {
                        grid-template-columns: 1fr;
                    }

                    .invite-details {
                        grid-template-columns: 1fr;
                    }

                    .invite-detail + .invite-detail {
                        border-left: 0;
                        border-top: 1px solid var(--invite-border);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .invite-submit,
                    .invite-field input {
                        transition: none;
                    }
                }
            `}</style>
    </>
  );
}
