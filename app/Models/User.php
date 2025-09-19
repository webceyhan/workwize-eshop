<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'company_name',
        'company_description',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    /**
     * Check if user is a supplier
     */
    public function isSupplier(): bool
    {
        return $this->role === UserRole::Supplier;
    }

    /**
     * Check if user is a customer
     */
    public function isCustomer(): bool
    {
        return $this->role === UserRole::Customer;
    }

    // RELATIONSHIPS ///////////////////////////////////////////////////////////////////////////////

    /**
     * Products relationship (for suppliers)
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'supplier_id');
    }

    /**
     * Orders relationship (for customers)
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }

    /**
     * Cart items relationship
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    // SCOPES //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Scope a query to only include admins.
     */
    protected function scopeAdmins(Builder $query): void
    {
        $query->where('role', UserRole::Admin);
    }

    /**
     * Scope a query to only include suppliers.
     */
    protected function scopeSuppliers(Builder $query): void
    {
        $query->where('role', UserRole::Supplier);
    }

    /**
     * Scope a query to only include customers.
     */
    protected function scopeCustomers(Builder $query): void
    {
        $query->where('role', UserRole::Customer);
    }
}
