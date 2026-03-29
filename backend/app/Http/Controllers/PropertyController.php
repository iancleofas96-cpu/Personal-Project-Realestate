<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\PropertyImage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PropertyController extends Controller
{
    /**
     * Get all properties
     */
    public function index(Request $request): JsonResponse
    {
        $query = Property::with(['user']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by listing type
        if ($request->has('listing_type')) {
            $query->where('listing_type', $request->listing_type);
        }

        // Filter by property type
        if ($request->has('property_type')) {
            $query->where('property_type', $request->property_type);
        }

        // Search by title or address
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('property_code', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $properties = $query->paginate($request->get('per_page', 12));

        // Load images for each property individually to avoid errors
        foreach ($properties->items() as $property) {
            try {
                $property->images = $property->images()
                    ->where('is_primary', true)
                    ->orderBy('sort_order', 'asc')
                    ->get();
            } catch (\Exception $e) {
                $property->images = collect();
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $properties,
        ]);
    }

    /**
     * Get a specific property
     */
    public function show(Property $property): JsonResponse
    {
        $property->load(['user']);
        
        // Load images separately to avoid errors
        try {
            $property->images = $property->images()
                ->orderBy('sort_order', 'asc')
                ->get();
        } catch (\Exception $e) {
            $property->images = collect();
        }

        return response()->json([
            'status' => 'success',
            'data' => $property,
        ]);
    }

    /**
     * Create a new property
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'property_type' => 'required|in:house,condo,apartment,lot,commercial',
            'listing_type' => 'required|in:sale,rent',
            'price' => 'required|numeric|min:0',
            'lot_area' => 'nullable|numeric|min:0',
            'floor_area' => 'nullable|numeric|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'parking_spaces' => 'nullable|integer|min:0',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:10',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status' => 'in:available,sold,reserved,pending',
            'listed_date' => 'nullable|date',
            'images' => 'array',
            'images.*' => 'image|mimes:jpeg,jpg,png,gif|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->all();
        $data['user_id'] = auth()->id();
        $data['property_code'] = Property::generatePropertyCode();
        $data['listed_date'] = $data['listed_date'] ?? now()->format('Y-m-d');

        $property = Property::create($data);

        // Handle image uploads
        if ($request->hasFile('images')) {
            $this->handleImageUploads($property, $request->file('images'));
        }

        $property->load(['user']);
        
        // Load images separately to avoid errors
        try {
            $property->images = $property->images()
                ->orderBy('sort_order', 'asc')
                ->get();
        } catch (\Exception $e) {
            $property->images = collect();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Property created successfully',
            'data' => $property,
        ], 201);
    }

    /**
     * Update a property
     */
    public function update(Request $request, Property $property): JsonResponse
    {
        // Check if user owns the property
        if ($property->user_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'property_type' => 'required|in:house,condo,apartment,lot,commercial',
            'listing_type' => 'required|in:sale,rent',
            'price' => 'required|numeric|min:0',
            'lot_area' => 'nullable|numeric|min:0',
            'floor_area' => 'nullable|numeric|min:0',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'parking_spaces' => 'nullable|integer|min:0',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:10',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'status' => 'in:available,sold,reserved,pending',
            'listed_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $property->update($request->all());

        $property->load(['user']);
        
        // Load images separately to avoid errors
        try {
            $property->images = $property->images()
                ->orderBy('sort_order', 'asc')
                ->get();
        } catch (\Exception $e) {
            $property->images = collect();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Property updated successfully',
            'data' => $property,
        ]);
    }

    /**
     * Delete a property
     */
    public function destroy(Property $property): JsonResponse
    {
        // Check if user owns the property
        if ($property->user_id !== auth()->id()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        // Delete property images
        foreach ($property->images as $image) {
            if ($image->image_path && Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
            $image->delete();
        }

        $property->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Property deleted successfully',
        ]);
    }

    /**
     * Get property statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_properties' => Property::count(),
            'available_properties' => Property::where('status', 'available')->count(),
            'sold_properties' => Property::where('status', 'sold')->count(),
            'for_sale' => Property::where('listing_type', 'sale')->count(),
            'for_rent' => Property::where('listing_type', 'rent')->count(),
            'total_value' => Property::sum('price'),
        ];

        // Properties by type
        $stats['by_type'] = Property::selectRaw('property_type, COUNT(*) as count')
            ->groupBy('property_type')
            ->get();

        // Properties by status
        $stats['by_status'] = Property::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $stats,
        ]);
    }

    /**
     * Handle image uploads
     */
    private function handleImageUploads(Property $property, array $images): void
    {
        foreach ($images as $index => $image) {
            $path = $image->store('properties/' . $property->id, 'public');
            
            PropertyImage::create([
                'property_id' => $property->id,
                'image_path' => $path,
                'is_primary' => $index === 0, // First image is primary
                'sort_order' => $index,
            ]);
        }
    }
}
