import { Head } from '@inertiajs/react';

export default function Privacy() {
    return (
        <>
            <Head title="Privacy policy" />
            <main className="legal-page">
                <div className="legal-shell">
                    <div className="auth-brand">
                        <img src="/images/mfm-youth-logo.png" alt="MFM Youth Church logo" />
                        <div>
                            <strong>MFM Youth Church CRM</strong>
                            <small>Ogba Youth Church</small>
                        </div>
                    </div>
                    <article className="card legal-document">
                        <h1>Privacy policy</h1>
                        <p>This MFM Youth Church CRM handles personal data for ministry administration and pastoral care.</p>
                        <p>We only retain data necessary for ministry operations, member care, and service delivery.</p>
                    </article>
                </div>
            </main>
        </>
    );
}
