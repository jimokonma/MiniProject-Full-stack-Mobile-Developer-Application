import { TrimPipe } from './trim.pipe';

describe('TrimPipe', () => {
  it('trims string fields in objects', () => {
    const pipe = new TrimPipe();
    const value = { a: ' x ', b: 2, c: 'y' } as any;
    expect(pipe.transform(value, {} as any)).toEqual({ a: 'x', b: 2, c: 'y' });
  });
});


