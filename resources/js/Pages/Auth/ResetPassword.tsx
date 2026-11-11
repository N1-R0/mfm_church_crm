import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AuthLayout from '@/Layouts/AuthLayout';
import { Button, Card, Field, Input } from '@/Components/UI';

export default function ResetPassword({ token, email }: { token: string; email?: string }) {
    const form = useForm({ token, email: email ?? '', password: '', password_confirmation: '' });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/reset-password');
    }

    return (
        <AuthLayout title="Create new password">
            <Card className="auth-card">
                <h1>Create a new password</h1>
                <p className="auth-copy">Choose a secure password for your MFM Youth Church CRM account.</p>
                <form onSubmit={submit} className="auth-form">
                    <Field label="Email address" error={form.errors.email}>
                        <Input type="email" autoComplete="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required />
                    </Field>
                    <Field label="New password" error={form.errors.password}>
                        <Input type="password" autoComplete="new-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} required />
                    </Field>
                    <Field label="Confirm password">
                        <Input type="password" autoComplete="new-password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} required />
                    </Field>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing ? 'Resetting…' : 'Reset password'}
                    </Button>
                </form>
            </Card>
        </AuthLayout>
    );
}
