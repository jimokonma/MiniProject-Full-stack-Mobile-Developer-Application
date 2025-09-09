<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:dropoff,mobile_wash',
            'status' => 'in:accepted,on_the_way,washing,complete,cancel',
            'vehicle_make' => 'required|string|max:255',
            'vehicle_model' => 'required|string|max:255',
            'vehicle_plate' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'scheduled_for' => 'required|date',
        ];
    }
}
