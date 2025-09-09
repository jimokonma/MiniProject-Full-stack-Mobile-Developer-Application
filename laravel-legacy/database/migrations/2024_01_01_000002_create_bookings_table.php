<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['dropoff', 'mobile_wash']);
            $table->enum('status', ['accepted', 'on_the_way', 'washing', 'complete', 'cancel'])->default('accepted');
            $table->string('vehicle_make');
            $table->string('vehicle_model');
            $table->string('vehicle_plate');
            $table->string('location');
            $table->timestamp('scheduled_for');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
