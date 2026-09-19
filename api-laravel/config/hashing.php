<?php

return [

    'driver' => 'bcrypt',

    'bcrypt' => [
        // Même coût que les autres backends (bcryptjs, cost 10).
        'rounds' => env('BCRYPT_ROUNDS', 10),

        // Les comptes créés par Express/NestJS sont hachés par bcryptjs, dont les hash
        // commencent par `$2a$`/`$2b$` (PHP écrit `$2y$`). Avec la vérification d'algorithme
        // activée (défaut Laravel), Hash::check() lève « This password does not use the
        // Bcrypt algorithm » : la base étant partagée, on laisse password_verify() trancher.
        'verify' => false,
    ],

    'argon' => [
        'memory' => 65536,
        'threads' => 1,
        'time' => 4,
        'verify' => env('HASH_VERIFY', true),
    ],

    'rehash_on_login' => true,

];
