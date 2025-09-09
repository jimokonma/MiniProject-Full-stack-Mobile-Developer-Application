<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LegacyBookingController;

Route::prefix('legacy')->group(function () {
    Route::get('/bookings/history', [LegacyBookingController::class, 'history']);
    Route::post('/bookings', [LegacyBookingController::class, 'store']);
});
