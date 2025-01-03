<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8',
            'user_type' => 'required|in:buyer,seller',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'user_type' => $validated['user_type'],
            'phone_number' => $validated['phone_number'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        $message = $this->getRoleSpecificMessage($user->user_type, 'registered');

        return response()->json([
            'message' => $message,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->user_type,
            ],
        ], 201);
    }

    /**
     * Log in an existing user.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string|min:8',
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json(['error' => 'Invalid login credentials! ❌'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        $message = $this->getRoleSpecificMessage($user->user_type, 'logged in');

        return response()->json([
            'message' => $message,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->user_type,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Log out the user and revoke token.
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();

        $message = $this->getRoleSpecificMessage($user->user_type, 'logged out');

        return response()->json(['message' => $message]);
    }

    /**
     * Generate role-specific messages (real estate theme).
     */
    private function getRoleSpecificMessage(string $role, string $action): string
    {
        $messages = [
            'buyer' => [
                'registered' => '🏡 Welcome, Buyer! Your account has been created. Start exploring dream properties!',
                'logged in' => '🔑 Hello Buyer! You are now logged in and ready to explore listings.',
                'logged out' => '👋 Goodbye Buyer! Come back soon for more property options!',
            ],
            'seller' => [
                'registered' => '🏠 Welcome, Seller! Your account has been created. Start listing your properties today!',
                'logged in' => '🗝️ Hello Seller! You are now logged in to manage your listings.',
                'logged out' => '👋 Goodbye Seller! Keep showcasing your properties for potential buyers!',
            ],
        ];

        return $messages[$role][$action] ?? 'Action completed successfully.';
    }
}
