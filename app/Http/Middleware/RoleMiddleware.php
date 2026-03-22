<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware {
    public function handle(Request $request, Closure $next, string ...$roles): mixed {
        if (!Auth::check()) {
            return redirect()->route('home');
        }

        $user = Auth::user();
        $roleId = (string) $user->role_id;

        // Admin role (3) always has access
        if ($roleId === '3') {
            return $next($request);
        }

        if (empty($roles)) {
            return $next($request);
        }

        if (in_array($roleId, $roles, true)) {
            return $next($request);
        }

        return redirect()->route('home');
    }
}
