import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Button, Card, Field, Input } from '@/Components/UI';

export default function OtpChallenge({ email }: { email: string }) {
    const form = useForm({ otp: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/login/otp');
    }

    return (
        <AuthLayout title="Verify sign-in code">
            <Card className="auth-card">
                <h1>Verify your sign-in code</h1>
                <p className="auth-copy">Enter the six-digit security code sent to {email}.</p>
                <form onSubmit={submit} className="auth-form">
                    <Field label="One-time code" error={form.errors.otp}>
                        <Input
                            className="auth-otp-input"
                            value={form.data.otp}
                            onChange={(e) => form.setData('otp', e.target.value)}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            aria-label="Six-digit one-time code"
                            autoFocus
                            required
                        />
                    </Field>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Verifying…' : 'Verify code'}
                    </Button>
                </form>
                <form method="post" action="/login/otp/resend" className="auth-form">
                    <Button className="auth-resend" type="submit" variant="secondary">Resend code</Button>
                </form>
            </Card>
        </AuthLayout>
    );
}
