<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\BookingController;

Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']); 

Route::get('properties', [PropertyController::class, 'index']);
Route::get('properties/{id}', [PropertyController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {

    Route::patch('properties/{id}/price', [PropertyController::class, 'updatePrice']); 
    Route::get('properties/search', [PropertyController::class, 'search']);
    Route::get('properties/sort', [PropertyController::class, 'sort']);
    
    Route::resource('properties', PropertyController::class)->only([
        'store', 'update', 'destroy'
    ]);

    Route::get('bookings', [BookingController::class, 'index']); 
    Route::get('bookings/{id}', [BookingController::class, 'show']); 
    Route::post('bookings', [BookingController::class, 'store']); 
    Route::put('bookings/{id}', [BookingController::class, 'update']); 
    Route::delete('bookings/{id}', [BookingController::class, 'destroy']); 
    Route::get('bookings/export/csv', [BookingController::class, 'export']);

    Route::get('booking-statistics', [BookingController::class, 'bookingStatistics']);

    Route::post('/logout', [AuthController::class, 'logout']);
});