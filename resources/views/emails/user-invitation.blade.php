<x-mail::message>
# You are invited to MFM Youth Church CRM

You have been invited to complete your account setup for MFM Youth Church CRM.

Use the link below to continue and choose your password.

<x-mail::button :url="$acceptUrl">
Complete account setup
</x-mail::button>

Your assigned role: {{ $role }}

Thanks,
{{ config('app.name') }}
</x-mail::message>
