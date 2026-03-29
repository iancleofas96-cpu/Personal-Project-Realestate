<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Property;
use App\Models\User;

class PropertyTest extends TestCase
{
    /**
     * Test if properties can be retrieved.
     */
    public function test_properties_can_be_retrieved(): void
    {
        $user = User::factory()->create();
        $property = Property::factory()->create([
            'user_id' => $user->id,
            'title' => 'Test Property',
            'price' => 1000000,
        ]);

        $response = $this->getJson('/api/properties');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'data' => [
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'price',
                        'user'
                    ]
                ]
            ]
        ]);
    }
}
