import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';

export default function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
    return (
        <>
            <Head title={title} />
            <main className="auth-page">
                <div className="auth-shell">
                    <div className="auth-brand">
                        <img src="/images/mfm-youth-logo.png" alt="MFM Youth Church logo" />
                        <div>
                            <strong>MFM Youth Church CRM</strong>
                            <small>Ogba Youth Church</small>
                        </div>
                    </div>
                    {children}
                    <p className="auth-footer">MFM Youth Church CRM · Ogba Youth Church</p>
                </div>
            </main>
        </>
    );
}
