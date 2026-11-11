<x-mail::message>
# Your sign-in code

Use the code below to complete your sign-in to MFM Youth Church CRM.

<strong style="font-size: 2rem; letter-spacing: 0.2em;">{{ $otp }}</strong>

This code expires in {{ $expiresInMinutes }} minutes.

Thanks,
{{ config('app.name') }}
</x-mail::message>
