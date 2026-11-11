<?php
return [
    'donations' => (bool) env('FEATURE_DONATIONS', env('FEATURE_DONATION', false)),
];
