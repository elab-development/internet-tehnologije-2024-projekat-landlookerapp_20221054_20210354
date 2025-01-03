<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Http\Resources\PropertyResource;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    /**
     * Display all properties (accessible to everyone).
     */
    public function index()
    {
        return PropertyResource::collection(Property::all());
    }

    /**
     * Display a single property (accessible to everyone).
     */
    public function show($id)
    {
        $property = Property::with('location')->findOrFail($id);
        return new PropertyResource($property);
    }

    /**
     * Store a new property (Only workers).
     */
    public function store(Request $request)
    {
        if (auth()->user()->user_type !== 'worker') {
            return response()->json(['error' => 'Unauthorized. Only workers can create properties.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'property_image' => 'nullable|url',
            'property_360_image' => 'nullable|url',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'size' => 'required|integer',
            'property_type' => 'required|string|in:house,apartment,villa',
            'bedrooms' => 'required|integer|min:1',
            'bathrooms' => 'required|integer|min:1',
            'year_built' => 'nullable|integer',
            'location_id' => 'required|exists:locations,id',
            'available_from' => 'nullable|date',
            'status' => 'required|string|in:available,sold,reserved',
        ]);

        $property = Property::create($validated);

        return new PropertyResource($property);
    }

    /**
     * Update an entire property (Only workers).
     */
    public function update(Request $request, $id)
    {
        if (auth()->user()->user_type !== 'worker') {
            return response()->json(['error' => 'Unauthorized. Only workers can update properties.'], 403);
        }

        $property = Property::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'property_image' => 'nullable|url',
            'property_360_image' => 'nullable|url',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric',
            'size' => 'sometimes|required|integer',
            'property_type' => 'sometimes|required|string|in:house,apartment,villa',
            'bedrooms' => 'sometimes|required|integer|min:1',
            'bathrooms' => 'sometimes|required|integer|min:1',
            'year_built' => 'nullable|integer',
            'location_id' => 'sometimes|required|exists:locations,id',
            'available_from' => 'nullable|date',
            'status' => 'sometimes|required|string|in:available,sold,reserved',
        ]);

        $property->update($validated);
        return new PropertyResource($property);
    }

    /**
     * Update the price of a property (Only workers).
     */
    public function updatePrice(Request $request, $id)
    {
        if (auth()->user()->user_type !== 'worker') {
            return response()->json(['error' => 'Unauthorized. Only workers can update prices.'], 403);
        }

        $request->validate([
            'price' => 'required|numeric',
        ]);

        $property = Property::findOrFail($id);
        $property->update(['price' => $request->price]);

        return new PropertyResource($property);
    }

    /**
     * Delete a property (Only workers).
     */
    public function destroy($id)
    {
        if (auth()->user()->user_type !== 'worker') {
            return response()->json(['error' => 'Unauthorized. Only workers can delete properties.'], 403);
        }

        $property = Property::findOrFail($id);
        $property->delete();

        return response()->json(['message' => 'Property deleted successfully.']);
    }
}
