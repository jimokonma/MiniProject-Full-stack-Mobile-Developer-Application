import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

// Trims string fields in DTOs; safe no-op for non-strings.
@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    if (value && typeof value === 'object') {
      const result: any = Array.isArray(value) ? [...value] : { ...value };
      for (const key of Object.keys(result)) {
        if (typeof result[key] === 'string') {
          result[key] = (result[key] as string).trim();
        }
      }
      return result;
    }
    if (typeof value === 'string') return value.trim();
    return value;
  }
}


