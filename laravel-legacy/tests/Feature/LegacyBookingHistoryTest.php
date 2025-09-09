<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LegacyBookingHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_booking_history(): void
    {
        $user = User::factory()->create();
        $booking = Booking::factory()->create(['user_id' => $user->id]);

        $response = $this->getJson('/api/legacy/bookings/history');

        $response->assertStatus(200)
            ->assertJsonStructure([
                '*' => [
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
                    'source',
                ]
            ])
            ->assertJsonFragment(['source' => 'laravel']);
    }

    public function test_booking_history_returns_empty_array_when_no_bookings(): void
    {
        $response = $this->getJson('/api/legacy/bookings/history');

        $response->assertStatus(200)
            ->assertJson([]);
    }
}
