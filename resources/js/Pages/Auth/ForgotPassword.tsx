import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Button, Card, Field, Input } from '@/Components/UI';

export default function ForgotPassword() {
    const form = useForm({ email: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/forgot-password');
    }

    return (
        <AuthLayout title="Reset password">
            <Card className="auth-card">
                <h1>Reset your password</h1>
                <p className="auth-copy">Enter your account email and we’ll send you a password reset link.</p>
                <form onSubmit={submit} className="auth-form">
                    <Field label="Email address" error={form.errors.email}>
                        <Input
                            type="email"
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            autoComplete="email"
                            required
                            autoFocus
                        />
                    </Field>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Sending…' : 'Send reset link'}
                    </Button>
                </form>
            </Card>
        </AuthLayout>
    );
}
