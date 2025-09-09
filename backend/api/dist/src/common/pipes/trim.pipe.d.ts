import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
export declare class TrimPipe implements PipeTransform {
    transform(value: any, _metadata: ArgumentMetadata): any;
}
