<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'property_code',
        'title',
        'description',
        'property_type',
        'listing_type',
        'price',
        'lot_area',
        'floor_area',
        'bedrooms',
        'bathrooms',
        'parking_spaces',
        'address',
        'city',
        'province',
        'zip_code',
        'latitude',
        'longitude',
        'status',
        'listed_date',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'lot_area' => 'decimal:2',
        'floor_area' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'listed_date' => 'date',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'parking_spaces' => 'integer',
    ];

    /**
     * Get the user that owns the property.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the images for the property.
     */
    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class);
    }

    /**
     * Get formatted price
     */
    public function getFormattedPriceAttribute(): string
    {
        return '₱' . number_format($this->price, 2);
    }

    /**
     * Get formatted lot area
     */
    public function getFormattedLotAreaAttribute(): string
    {
        return $this->lot_area ? number_format($this->lot_area, 2) . ' sqm' : 'N/A';
    }

    /**
     * Get formatted floor area
     */
    public function getFormattedFloorAreaAttribute(): string
    {
        return $this->floor_area ? number_format($this->floor_area, 2) . ' sqm' : 'N/A';
    }

    /**
     * Get full address
     */
    public function getFullAddressAttribute(): string
    {
        $addressParts = array_filter([
            $this->address,
            $this->city,
            $this->province,
            $this->zip_code,
        ]);

        return implode(', ', $addressParts);
    }

    /**
     * Generate unique property code
     */
    public static function generatePropertyCode(): string
    {
        $prefix = 'PROP';
        $year = date('Y');
        $random = strtoupper(substr(md5(uniqid()), 0, 6));
        
        return "{$prefix}-{$year}-{$random}";
    }
}
