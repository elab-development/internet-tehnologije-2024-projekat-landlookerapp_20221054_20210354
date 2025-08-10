<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Property;
use App\Http\Resources\BookingResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\BookingsExport;

class BookingController extends Controller
{
    /**
     * Booking statistics FOR THE LOGGED-IN WORKER ONLY.
     * Returns top 5 properties by number of bookings handled by this worker.
     */
    public function bookingStatistics()
    {
        $user = auth()->user();

        if ($user->user_type !== 'worker') {
            return response()->json(['error' => 'Unauthorized. Only workers can view booking statistics.'], 403);
       }

        // Count only bookings that this worker is assigned to
        // Assumes Property has a `bookings()` relationship (it does, since you used withCount('bookings') earlier)
        $statistics = Property::withCount([
                'bookings as bookings_count' => function ($q) use ($user) {
                    $q->where('worker_id', $user->id);
                }
            ])
            ->orderByDesc('bookings_count')
            ->take(5)
            ->get(['id', 'name']);

        return response()->json([
            'top_booked_properties' => $statistics
        ]);
    }

    /**
     * Buyer: list their own bookings.
     */
    public function index()
    {
        $user = auth()->user();

        if ($user->user_type !== 'buyer') {
            return response()->json(['error' => 'Unauthorized. Only buyers can view their bookings.'], 403);
        }

        $bookings = Booking::with(['worker:id,name,email'])
            ->where('buyer_id', $user->id)
            ->get();

        return BookingResource::collection($bookings);
    }

    /**
     * Buyer: view one of their bookings.
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
     * Buyer: create a booking.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        if ($user->user_type !== 'buyer') {
            return response()->json(['error' => 'Unauthorized. Only buyers can create bookings.'], 403);
        }

        $validated = $request->validate([
            'property_id'    => 'required|exists:properties,id',
            'booking_date'   => 'required|date',
            'status'         => 'required|in:pending,confirmed,cancelled',
            'total_price'    => 'required|numeric|min:0',
            'payment_method' => 'required|in:credit_card,bank_transfer,paypal',
            'worker_id'      => [
                'required',
                Rule::exists('users', 'id')->where('user_type', 'worker'),
            ],
        ]);

        $booking = Booking::create([
            'property_id'    => $validated['property_id'],
            'buyer_id'       => $user->id,
            'worker_id'      => $validated['worker_id'],
            'booking_date'   => $validated['booking_date'],
            'status'         => $validated['status'],
            'total_price'    => $validated['total_price'],
            'payment_method' => $validated['payment_method'],
        ]);

        return new BookingResource($booking);
    }

    /**
     * Buyer: update their own booking.
     */
    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if (auth()->user()->id !== $booking->buyer_id) {
            return response()->json(['error' => 'Unauthorized. You can only update your own bookings.'], 403);
        }

        $validated = $request->validate([
            'booking_date'   => 'sometimes|required|date',
            'status'         => 'sometimes|required|in:pending,confirmed,cancelled',
            'total_price'    => 'sometimes|required|numeric|min:0',
            'payment_method' => 'sometimes|required|in:credit_card,bank_transfer,paypal',
        ]);

        $booking->update($validated);

        return new BookingResource($booking);
    }

    /**
     * Buyer: delete their own booking.
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
     * Buyer: export bookings as CSV.
     */
    public function export()
    {
        $user = auth()->user();

        if ($user->user_type !== 'buyer') {
            return response()->json(['error' => 'Unauthorized. Only buyers can export bookings.'], 403);
        }

        return Excel::download(new BookingsExport($user->id), 'bookings.csv');
    }

    /**
     * NEW: Worker: list bookings where this worker is assigned.
     */
    public function workerIndex()
    {
        $user = auth()->user();

        if ($user->user_type !== 'worker') {
            return response()->json(['error' => 'Unauthorized. Only workers can view their bookings.'], 403);
        }

        $bookings = Booking::with([
                'buyer:id,name,email',
                'property:id,name',
            ])
            ->where('worker_id', $user->id)
            ->orderByDesc('booking_date')
            ->get();

        return BookingResource::collection($bookings);
    }

    /**
     * NEW: Worker: update ONLY the status of a booking they own.
     */
    public function updateStatus(Request $request, $id)
    {
        $user = auth()->user();

        if ($user->user_type !== 'worker') {
            return response()->json(['error' => 'Unauthorized. Only workers can update booking status.'], 403);
        }

        $booking = Booking::findOrFail($id);

        if ((int) $booking->worker_id !== (int) $user->id) {
            return response()->json(['error' => 'Unauthorized. You can only update your own bookings.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $booking->status = $validated['status'];
        $booking->save();

        // eager-load minimal for UI
        $booking->load(['buyer:id,name,email', 'property:id,name']);

        return new BookingResource($booking);
    }
}
