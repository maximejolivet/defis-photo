<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pseudo' => ['required', 'string'],
            'pin' => ['required', 'digits:4'],
        ], [
            'pseudo.required' => 'Données incomplètes (pseudo et code PIN requis).',
            'pin.required' => 'Données incomplètes (pseudo et code PIN requis).',
            'pin.digits' => 'Le code PIN doit contenir exactement 4 chiffres.',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 400);
        }

        $pseudo = trim($request->string('pseudo'));
        if ($pseudo === '') {
            return response()->json(['message' => 'Le pseudo ne peut pas être vide.'], 400);
        }

        if (User::where('pseudo', $pseudo)->exists()) {
            return response()->json(['message' => 'Ce pseudo est déjà utilisé.'], 409);
        }

        User::create([
            'pseudo' => $pseudo,
            'password' => Hash::make($request->string('pin')),
        ]);

        return response()->json(['message' => 'Utilisateur créé avec succès.']);
    }

    public function login(Request $request)
    {
        $pseudo = $request->input('pseudo');
        $pin = $request->input('pin');

        if (! $pseudo || ! $pin) {
            return response()->json(['message' => 'Données manquantes (pseudo ou code PIN).'], 400);
        }

        $user = User::where('pseudo', trim($pseudo))->first();

        if (! $user || ! Hash::check($pin, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Connexion réussie.',
            'token' => $token,
            'user' => ['id' => $user->id, 'pseudo' => $user->pseudo],
        ]);
    }
}
