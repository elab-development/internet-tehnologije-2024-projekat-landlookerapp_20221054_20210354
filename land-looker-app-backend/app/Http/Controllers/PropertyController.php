<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Http\Resources\PropertyResource;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    /**
     * Display all properties (Accessible to everyone).
     */
    public function index()
    {
        $props = Property::with('location:id,city,state,country,latitude,longitude')
            ->select('id','name','price','size','property_type','status','property_image','location_id')
            ->get();

        return PropertyResource::collection($props);
    }

    /**
     * Search properties by name (Only buyers can search).
     */
    public function search(Request $request)
    {
        if (!auth()->check() || auth()->user()->user_type !== 'buyer') {
            return response()->json(['error' => 'Unauthorized. Only buyers can search properties.'], 403);
        }

        $request->validate([
            'search' => 'required|string|max:255',
        ]);

        $properties = Property::where('name', 'like', '%' . $request->input('search') . '%')->get();
        return PropertyResource::collection($properties);
    }

    /**
     * Sort properties by a specified field (Only buyers can sort).
     */
    public function sort(Request $request)
    {
        if (!auth()->check() || auth()->user()->user_type !== 'buyer') {
            return response()->json(['error' => 'Unauthorized. Only buyers can sort properties.'], 403);
        }

        $request->validate([
            'sort_by' => 'required|string|in:name,price,size,bedrooms,bathrooms',
            'order' => 'nullable|in:asc,desc'
        ]);

        $order = $request->input('order', 'asc');
        $properties = Property::orderBy($request->input('sort_by'), $order)->get();

        return PropertyResource::collection($properties);
    }

    /**
     * Display a single property (Accessible to everyone).
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
            return response()->json(['error' => 'Unauthorized. Only workers can update the price.'], 403);
        }

        $request->validate([
            'price' => 'required|numeric|min:0',
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
