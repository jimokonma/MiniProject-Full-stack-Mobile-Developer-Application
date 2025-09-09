export declare enum BookingStatusDto {
    accepted = "accepted",
    on_the_way = "on_the_way",
    washing = "washing",
    complete = "complete",
    cancel = "cancel"
}
export declare class UpdateStatusDto {
    status: BookingStatusDto;
}
