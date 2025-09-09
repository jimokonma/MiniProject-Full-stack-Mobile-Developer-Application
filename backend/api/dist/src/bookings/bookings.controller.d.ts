import { BookingsService } from './bookings.service';
import { UpdateStatusDto } from './dto/update-status.dto';
declare enum BookingTypeDto {
    dropoff = "dropoff",
    mobile_wash = "mobile_wash"
}
declare class CreateBookingDto {
    serviceType: BookingTypeDto;
    vehicleMake: string;
    vehicleModel: string;
    vehiclePlate: string;
    location: string;
    scheduledFor: string;
}
export declare class BookingsController {
    private readonly bookings;
    constructor(bookings: BookingsService);
    create(req: any, dto: CreateBookingDto, idempotencyKey?: string): Promise<any>;
    list(req: any, me?: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.BookingType;
        status: import("@prisma/client").$Enums.BookingStatus;
        vehicleMake: string;
        vehicleModel: string;
        vehiclePlate: string;
        location: string;
        scheduledFor: Date;
        updatedAt: Date;
    }[]>;
    history(req: any): Promise<{
        source: string;
        id: string;
        userId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.BookingType;
        status: import("@prisma/client").$Enums.BookingStatus;
        vehicleMake: string;
        vehicleModel: string;
        vehiclePlate: string;
        location: string;
        scheduledFor: Date;
        updatedAt: Date;
    }[]>;
    detail(id: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.BookingType;
        status: import("@prisma/client").$Enums.BookingStatus;
        vehicleMake: string;
        vehicleModel: string;
        vehiclePlate: string;
        location: string;
        scheduledFor: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, body: UpdateStatusDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        type: import("@prisma/client").$Enums.BookingType;
        status: import("@prisma/client").$Enums.BookingStatus;
        vehicleMake: string;
        vehicleModel: string;
        vehiclePlate: string;
        location: string;
        scheduledFor: Date;
        updatedAt: Date;
    }>;
}
export {};
