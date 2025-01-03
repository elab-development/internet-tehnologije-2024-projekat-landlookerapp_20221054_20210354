<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;

Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']); 

Route::get('properties', [PropertyController::class, 'index']);
Route::get('properties/{id}', [PropertyController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('properties', [PropertyController::class, 'store']); 
    Route::put('properties/{id}', [PropertyController::class, 'update']); 
    Route::patch('properties/{id}/price', [PropertyController::class, 'updatePrice']); 
    Route::delete('properties/{id}', [PropertyController::class, 'destroy']);

    Route::post('/logout', [AuthController::class, 'logout']);
});