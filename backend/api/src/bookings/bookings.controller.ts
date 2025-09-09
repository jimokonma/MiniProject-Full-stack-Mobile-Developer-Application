import { Body, Controller, Get, Headers, Param, Post, Query, UseGuards, Req, Patch } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateStatusDto } from './dto/update-status.dto';

enum BookingTypeDto {
  dropoff = 'dropoff',
  mobile_wash = 'mobile_wash',
}

class CreateBookingDto {
  @IsEnum(BookingTypeDto)
  serviceType!: BookingTypeDto;

  @IsString() @MinLength(1)
  vehicleMake!: string;

  @IsString() @MinLength(1)
  vehicleModel!: string;

  @IsString() @MinLength(1)
  vehiclePlate!: string;

  @IsString() @MinLength(1)
  location!: string;

  @IsDateString()
  scheduledFor!: string;
}

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiHeader({ name: 'Idempotency-Key', description: 'Unique key for idempotent requests', required: true })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or missing Idempotency-Key' })
  async create(
    @Req() req: any,
    @Body() dto: CreateBookingDto,
    @Headers('Idempotency-Key') idempotencyKey?: string,
  ) {
    return this.bookings.create(req.user.userId, dto, idempotencyKey);
  }

  @Get()
  @ApiOperation({ summary: 'List bookings' })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  async list(@Req() req: any, @Query('me') me?: string) {
    if (me === 'true') return this.bookings.listByUser(req.user.userId);
    return this.bookings.listAll();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get merged booking history (NestJS + Laravel)' })
  @ApiResponse({ status: 200, description: 'Merged booking history' })
  async history(@Req() req: any) {
    return this.bookings.historyMerged(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async detail(@Param('id') id: string) {
    return this.bookings.detail(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update booking status' })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status value' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.bookings.updateStatus(id, body.status);
  }
}


