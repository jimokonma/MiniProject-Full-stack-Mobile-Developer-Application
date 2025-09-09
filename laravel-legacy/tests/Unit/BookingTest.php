<?php

namespace Tests\Unit;

use App\Models\Booking;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_booking_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $booking = Booking::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $booking->user);
        $this->assertEquals($user->id, $booking->user->id);
    }

    public function test_booking_has_many_history_records(): void
    {
        $booking = Booking::factory()->create();
        
        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $booking->bookingHistory);
    }
}
