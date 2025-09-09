<?php

namespace App\Jobs;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class LogLegacyWrite implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Booking $booking
    ) {}

    public function handle(): void
    {
        Log::info('Legacy booking write', [
            'booking_id' => $this->booking->id,
            'user_id' => $this->booking->user_id,
            'type' => $this->booking->type,
            'status' => $this->booking->status,
            'created_at' => $this->booking->created_at,
        ]);
    }
}
