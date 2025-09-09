<?php

namespace Tests\Feature;

use App\Models\User;
use App\Jobs\LogLegacyWrite;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LegacyBookingStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_store_booking_with_valid_data(): void
    {
        Queue::fake();
        
        $user = User::factory()->create();
        
        $bookingData = [
            'user_id' => $user->id,
            'type' => 'dropoff',
            'status' => 'accepted',
            'vehicle_make' => 'Tesla',
            'vehicle_model' => 'Model 3',
            'vehicle_plate' => 'ABC123',
            'location' => 'Test Location',
            'scheduled_for' => now()->addDay()->toISOString(),
        ];

        $response = $this->postJson('/api/legacy/bookings', $bookingData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'user_id',
                'type',
                'status',
                'vehicle_make',
                'vehicle_model',
                'vehicle_plate',
                'location',
                'scheduled_for',
                'created_at',
                'updated_at',
            ]);

        Queue::assertPushed(LogLegacyWrite::class);
    }

    public function test_booking_store_validation_fails_with_invalid_data(): void
    {
        $response = $this->postJson('/api/legacy/bookings', []);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'code',
                'message',
                'details',
            ])
            ->assertJsonFragment(['code' => 'VALIDATION_ERROR']);
    }
}
