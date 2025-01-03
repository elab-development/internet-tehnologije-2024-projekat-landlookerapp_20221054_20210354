<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Property;
use App\Http\Resources\BookingResource;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\BookingsExport;

class BookingController extends Controller
{
    /**
     * Display booking statistics for sellers only.
     */
    public function bookingStatistics()
    {
        $user = auth()->user();

        if ($user->user_type !== 'seller') {
            return response()->json(['error' => 'Unauthorized. Only sellers can view booking statistics.'], 403);
        }

        $statistics = Property::withCount('bookings')
            ->orderByDesc('bookings_count')
            ->take(5)
            ->get();

        return response()->json([
            'top_booked_properties' => $statistics
        ]);
    }

    /**
     * Display all bookings for the authenticated buyer.
     */
    public function index()
    {
        $user = auth()->user();

        if ($user->user_type !== 'buyer') {
            return response()->json(['error' => 'Unauthorized. Only buyers can view their bookings.'], 403);
        }

        $bookings = Booking::where('buyer_id', $user->id)->get();
        return BookingResource::collection($bookings);
    }

    /**
     * Show a specific booking (only for the authenticated buyer).
     */
    public function show($id)
    {
        $booking = Booking::with(['buyer', 'worker', 'property'])->findOrFail($id);

        if (auth()->user()->id !== $booking->buyer_id) {
            return response()->json(['error' => 'Unauthorized. You can only view your own bookings.'], 403);
        }

        return new BookingResource($booking);
    }
}
