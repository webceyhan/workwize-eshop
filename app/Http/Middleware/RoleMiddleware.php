<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Handle special case for 'customer_or_guest' - allows guests and customers, blocks suppliers
        if ($role === 'customer_or_guest') {
            if (Auth::check() && Auth::user()->role->value === 'supplier') {
                return redirect()->route('supplier.dashboard')
                    ->with('error', 'Suppliers cannot access the shop area. Please use the supplier dashboard.');
            }

            return $next($request);
        }

        // Standard role checking - requires authentication and specific role
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        if (Auth::user()->role->value !== $role) {
            abort(403, 'Unauthorized access.');
        }

        return $next($request);
    }
}
