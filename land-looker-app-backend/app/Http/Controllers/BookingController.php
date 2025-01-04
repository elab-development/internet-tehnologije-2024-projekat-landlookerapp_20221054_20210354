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
     * Display booking statistics for workers only.
     */
    public function bookingStatistics()
    {
        $user = auth()->user();

        if ($user->user_type !== 'worker') {
            return response()->json(['error' => 'Unauthorized. Only workers can view booking statistics.'], 403);
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

        /**
     * Create a new booking (only for buyers).
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        if ($user->user_type !== 'buyer') {
            return response()->json(['error' => 'Unauthorized. Only buyers can create bookings.'], 403);
        }

        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'booking_date' => 'required|date',
            'status' => 'required|in:pending,confirmed,cancelled',
            'total_price' => 'required|numeric|min:0',
            'payment_method' => 'required|in:credit_card,bank_transfer,paypal',
        ]);

        $booking = Booking::create([
            'property_id' => $validated['property_id'],
            'buyer_id' => $user->id,
            'worker_id' => Property::find($validated['property_id'])->location->id,
            'booking_date' => $validated['booking_date'],
            'status' => $validated['status'],
            'total_price' => $validated['total_price'],
            'payment_method' => $validated['payment_method'],
        ]);

        return new BookingResource($booking);
    }

    /**
     * Update an existing booking (only for buyers).
     */
    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if (auth()->user()->id !== $booking->buyer_id) {
            return response()->json(['error' => 'Unauthorized. You can only update your own bookings.'], 403);
        }

        $validated = $request->validate([
            'booking_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:pending,confirmed,cancelled',
            'total_price' => 'sometimes|required|numeric|min:0',
            'payment_method' => 'sometimes|required|in:credit_card,bank_transfer,paypal',
        ]);

        $booking->update($validated);
        return new BookingResource($booking);
    }

    /**
     * Delete a booking (only for buyers).
     */
    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);

        if (auth()->user()->id !== $booking->buyer_id) {
            return response()->json(['error' => 'Unauthorized. You can only delete your own bookings.'], 403);
        }

        $booking->delete();
        return response()->json(['message' => 'Booking deleted successfully.']);
    }

    /**
     * Export bookings for the authenticated buyer as a CSV file.
     */
    public function export()
    {
        $user = auth()->user();

        if ($user->user_type !== 'buyer') {
            return response()->json(['error' => 'Unauthorized. Only buyers can export bookings.'], 403);
        }

        return Excel::download(new BookingsExport($user->id), 'bookings.csv');
    }
}
