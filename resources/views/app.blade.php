<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title inertia>MFM Youth Church CRM</title>
  <script>try{if(localStorage.theme==='dark'||(!('theme' in localStorage)&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}</script>
  @viteReactRefresh
  @vite(['resources/css/app.css', 'resources/js/app.tsx'])
  @inertiaHead
</head>
<body><div id="app" data-page="{{ json_encode($page) }}"></div></body>
</html>
