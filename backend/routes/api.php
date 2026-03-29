<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\PropertyController;
use App\Models\Property;

Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Backend is running'
    ]);
});

// Debug route for testing Property model
Route::get('/debug/properties', function () {
    try {
        $properties = Property::with('user')->get();
        return response()->json([
            'status' => 'success',
            'count' => $properties->count(),
            'data' => $properties->take(3)->map(function($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'price' => $property->price,
                    'user' => $property->user ? $property->user->name : 'No user'
                ];
            })
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Auth routes - public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Properties (temporarily without auth for testing)
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/stats', [PropertyController::class, 'stats']);

// Auth routes - protected (JWT)
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    
    // Dashboard - protected route
    Route::get('/dashboard', function () {
        return response()->json([
            'total_properties' => 150,
            'active_listings' => 45,
            'sold_this_month' => 12,
            'revenue' => 2500000,
            'recent_properties' => [
                ['id' => 1, 'name' => 'Condo Unit A', 'price' => 3500000, 'status' => 'available'],
                ['id' => 2, 'name' => 'House Lot B', 'price' => 5000000, 'status' => 'sold'],
                ['id' => 3, 'name' => 'Apartment C', 'price' => 2800000, 'status' => 'available'],
            ]
        ]);
    });

    // Properties (protected)
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::get('/properties/{property}', [PropertyController::class, 'show']);
    Route::put('/properties/{property}', [PropertyController::class, 'update']);
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);

    // Activity logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/recent', [ActivityLogController::class, 'recent']);
    Route::get('/activity-logs/stats', [ActivityLogController::class, 'stats']);
});