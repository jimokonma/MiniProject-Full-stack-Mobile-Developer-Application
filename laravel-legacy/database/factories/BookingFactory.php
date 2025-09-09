<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['dropoff', 'mobile_wash']),
            'status' => fake()->randomElement(['accepted', 'on_the_way', 'washing', 'complete', 'cancel']),
            'vehicle_make' => fake()->randomElement(['Tesla', 'BMW', 'Mercedes', 'Audi']),
            'vehicle_model' => fake()->randomElement(['Model 3', 'X5', 'C-Class', 'A4']),
            'vehicle_plate' => fake()->regexify('[A-Z]{3}[0-9]{3}'),
            'location' => fake()->address(),
            'scheduled_for' => fake()->dateTimeBetween('now', '+1 month'),
        ];
    }
}
