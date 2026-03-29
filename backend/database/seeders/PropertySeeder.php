<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Property;
use App\Models\User;

class PropertySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        
        if (!$user) {
            $user = User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
                'role' => 'admin'
            ]);
        }

        Property::firstOrCreate([
            'property_code' => 'PROP-2024-ABC123'
        ], [
            'user_id' => $user->id,
            'title' => 'Modern Condo Unit A',
            'description' => 'Beautiful modern condo with city view',
            'property_type' => 'condo',
            'listing_type' => 'sale',
            'price' => 3500000,
            'lot_area' => null,
            'floor_area' => 85.50,
            'bedrooms' => 2,
            'bathrooms' => 2,
            'parking_spaces' => 1,
            'address' => '123 Makati Avenue',
            'city' => 'Makati',
            'province' => 'Metro Manila',
            'zip_code' => '1200',
            'latitude' => 14.5547,
            'longitude' => 121.0244,
            'status' => 'available',
            'listed_date' => now()->format('Y-m-d')
        ]);

        Property::firstOrCreate([
            'property_code' => 'PROP-2024-DEF456'
        ], [
            'user_id' => $user->id,
            'title' => 'House Lot B',
            'description' => 'Spacious house with garden',
            'property_type' => 'house',
            'listing_type' => 'sale',
            'price' => 5000000,
            'lot_area' => 250.00,
            'floor_area' => 180.00,
            'bedrooms' => 4,
            'bathrooms' => 3,
            'parking_spaces' => 2,
            'address' => '456 Quezon Street',
            'city' => 'Quezon City',
            'province' => 'Metro Manila',
            'zip_code' => '1100',
            'latitude' => 14.6760,
            'longitude' => 121.0437,
            'status' => 'sold',
            'listed_date' => now()->subDays(10)->format('Y-m-d')
        ]);

        Property::firstOrCreate([
            'property_code' => 'PROP-2024-GHI789'
        ], [
            'user_id' => $user->id,
            'title' => 'Apartment C',
            'description' => 'Cozy apartment in prime location',
            'property_type' => 'apartment',
            'listing_type' => 'sale',
            'price' => 2800000,
            'lot_area' => null,
            'floor_area' => 65.00,
            'bedrooms' => 1,
            'bathrooms' => 1,
            'parking_spaces' => 0,
            'address' => '789 Pasig Boulevard',
            'city' => 'Pasig',
            'province' => 'Metro Manila',
            'zip_code' => '1600',
            'latitude' => 14.5764,
            'longitude' => 121.0851,
            'status' => 'available',
            'listed_date' => now()->subDays(5)->format('Y-m-d')
        ]);
    }
}
