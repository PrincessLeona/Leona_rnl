<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GenderController extends Controller
{
    public function storeGender(Request $request) {
        $validated = $request->validate([
            'gender' => ['required', 'min:4', 'max:10']
        ]);

        Gender::create([
            'gender' => $validated['gender']
        ]);

        return response()->json([
            'message' => 'Gender Successfully Added.'
        ], 200);
    }
}
