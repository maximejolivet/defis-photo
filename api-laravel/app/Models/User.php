<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Model;
use Tymon\JWTAuth\Contracts\JWTSubject;

// Le guard `jwt` (config/auth.php) résout l'utilisateur via le provider Eloquent puis appelle
// getAuthIdentifierName() : sans l'interface Authenticatable, toute route `auth:api` plantait.
class User extends Model implements AuthenticatableContract, JWTSubject
{
    use Authenticatable;

    public $timestamps = false;

    protected $table = 'users';

    protected $fillable = ['pseudo', 'password'];

    protected $hidden = ['password'];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return ['pseudo' => $this->pseudo];
    }
}
