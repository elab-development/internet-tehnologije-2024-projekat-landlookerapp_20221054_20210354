<?php

return [
    'paths' => ['api/*', 'images/*', 'storage/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'], // or your prod domain
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // set true only if you send cookies
];
