<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'total_amount',
        'status',
        'shipping_address',
        'billing_address',
        'payment_method',
        'shipped_at',
        'delivered_at',
    ];

    protected $casts = [
        'total_amount' => 'float',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'status' => OrderStatus::class,
    ];

    // RELATIONSHIPS ///////////////////////////////////////////////////////////////////////////////

    /**
     * Get the customer that owns the order
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Get the order items for the order
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get all products in this order through order items
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot('quantity', 'unit_price', 'total_price')
            ->withTimestamps();
    }

    /**
     * Calculate total amount from order items
     */
    public function calculateTotal()
    {
        return $this->orderItems->sum('total_price');
    }

    /**
     * Check if the order can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [OrderStatus::Pending, OrderStatus::Processing]);
    }

    /**
     * Check if a supplier can manage this order (has products in it)
     */
    public function canBeManagedBySupplier($supplierId): bool
    {
        return $this->orderItems()
            ->whereHas('product', function ($query) use ($supplierId) {
                $query->where('supplier_id', $supplierId);
            })
            ->exists();
    }

    // SCOPES //////////////////////////////////////////////////////////////////////////////////////

    /**
     * Scope for pending orders
     */
    protected function scopePending(Builder $query): void
    {
        $query->where('status', OrderStatus::Pending);
    }

    /**
     * Scope for processing orders
     */
    protected function scopeProcessing(Builder $query): void
    {
        $query->where('status', OrderStatus::Processing);
    }

    /**
     * Scope for shipped orders
     */
    protected function scopeShipped(Builder $query): void
    {
        $query->where('status', OrderStatus::Shipped);
    }

    /**
     * Scope for delivered orders
     */
    protected function scopeDelivered(Builder $query): void
    {
        $query->where('status', OrderStatus::Delivered);
    }

    /**
     * Scope for cancelled orders
     */
    protected function scopeCancelled(Builder $query): void
    {
        $query->where('status', OrderStatus::Cancelled);
    }
}
