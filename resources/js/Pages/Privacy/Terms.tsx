import { Head } from '@inertiajs/react';

export default function Terms() {
    return (
        <>
            <Head title="Terms" />
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
                        <h1>Terms</h1>
                        <p>Use of MFM Youth Church CRM is intended for approved church roles and ministry administration related to member care and engagement.</p>
                    </article>
                </div>
            </main>
        </>
    );
}
