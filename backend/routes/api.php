<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/test', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'Backend is running'
    ]);
});


// Auth routes - public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Auth routes - protected (JWT)
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
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
});