<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User administration</title>
</head>
<body>
    <h1>User administration</h1>
    <ul>
        @foreach($users as $user)
            <li>{{ $user->name }} ({{ $user->email }}) - {{ $user->role }} / {{ $user->status }}</li>
        @endforeach
    </ul>
</body>
</html>
