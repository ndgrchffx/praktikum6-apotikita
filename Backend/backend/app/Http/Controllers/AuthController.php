<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Fitur Register 
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors()->toJson(), 400);
        }

        $user = User::create([
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'password' => Hash::make($request->get('password')),
        ]);

        return response()->json([
            'message' => 'User successfully registered',
            'user' => $user
        ], 201);
    }

    // Fitur Login (Mendapatkan JWT Token)
    public function login()
    {
        $credentials = request(['email', 'password']);

        // TAMBAHKAN 'api' di dalem kurung auth
        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Email atau password salah'], 401);
        }

        return $this->respondWithToken($token);
    }


    // Fitur Logout 
    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'Berhasil keluar']);
    }

    // Fitur Refresh Token 
    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    // Format Response Token 
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
}
