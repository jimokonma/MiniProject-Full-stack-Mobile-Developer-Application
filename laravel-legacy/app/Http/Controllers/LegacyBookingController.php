<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Models\Booking;
use App\Jobs\LogLegacyWrite;
use Illuminate\Http\Request;

class LegacyBookingController extends Controller
{
    public function history(Request $request)
    {
        $bookings = Booking::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'user_id' => $booking->user_id,
                    'type' => $booking->type,
                    'status' => $booking->status,
                    'vehicle_make' => $booking->vehicle_make,
                    'vehicle_model' => $booking->vehicle_model,
                    'vehicle_plate' => $booking->vehicle_plate,
                    'location' => $booking->location,
                    'scheduled_for' => $booking->scheduled_for,
                    'created_at' => $booking->created_at,
                    'source' => 'laravel',
                ];
            });

        return response()->json($bookings);
    }

    public function store(StoreBookingRequest $request)
    {
        $booking = Booking::create($request->validated());
        
        // Dispatch job to log the write
        LogLegacyWrite::dispatch($booking);
        
        return response()->json($booking, 201);
    }
}
