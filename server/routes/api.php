<?php

use App\Http\Controllers\Api\GenderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::controller(GenderController::class)->group(function() {
    Route::post('/storeGender', 'storeGender');
});