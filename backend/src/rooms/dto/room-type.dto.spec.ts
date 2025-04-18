import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateRoomTypeDto, UpdateRoomTypeDto } from './room-type.dto';

describe('RoomTypeDto', () => {
  describe('CreateRoomTypeDto', () => {
    const validBaseDto = {
      name: 'Deluxe Room',
      code: 'deluxe',
      description: 'A spacious deluxe room with all amenities',
      pricePerNight: 150,
      maxGuests: 2,
    };

    const createDto = (overrides = {}) =>
      plainToClass(CreateRoomTypeDto, { ...validBaseDto, ...overrides });

    const validateDto = async (dto: CreateRoomTypeDto) => {
      const errors = await validate(dto);
      return { errors, hasErrors: errors.length > 0 };
    };

    describe('validation', () => {
      it('should validate all fields correctly', async () => {
        // Test valid data with all fields
        const validDto = createDto({
          ...validBaseDto,
          imageUrl: 'https://example.com/deluxe.jpg',
          displayOrder: 1,
          amenities: ['wifi', 'tv', 'minibar'],
        });
        const { errors: validErrors } = await validateDto(validDto);
        expect(validErrors.length).toBe(0);

        // Test valid data with required fields only
        const minimalDto = createDto(validBaseDto);
        const { errors: minimalErrors } = await validateDto(minimalDto);
        expect(minimalErrors.length).toBe(0);

        // Test missing required fields
        const missingNameDto = createDto({ ...validBaseDto, name: undefined });
        const { errors: nameErrors } = await validateDto(missingNameDto);
        expect(nameErrors.length).toBeGreaterThan(0);
        expect(nameErrors.some(error => error.property === 'name')).toBe(true);

        const missingCodeDto = createDto({ ...validBaseDto, code: undefined });
        const { errors: codeErrors } = await validateDto(missingCodeDto);
        expect(codeErrors.length).toBeGreaterThan(0);
        expect(codeErrors.some(error => error.property === 'code')).toBe(true);

        const missingDescriptionDto = createDto({ ...validBaseDto, description: undefined });
        const { errors: descriptionErrors } = await validateDto(missingDescriptionDto);
        expect(descriptionErrors.length).toBeGreaterThan(0);
        expect(descriptionErrors.some(error => error.property === 'description')).toBe(true);

        const missingPriceDto = createDto({ ...validBaseDto, pricePerNight: undefined });
        const { errors: priceErrors } = await validateDto(missingPriceDto);
        expect(priceErrors.length).toBeGreaterThan(0);
        expect(priceErrors.some(error => error.property === 'pricePerNight')).toBe(true);

        const missingMaxGuestsDto = createDto({ ...validBaseDto, maxGuests: undefined });
        const { errors: maxGuestsErrors } = await validateDto(missingMaxGuestsDto);
        expect(maxGuestsErrors.length).toBeGreaterThan(0);
        expect(maxGuestsErrors.some(error => error.property === 'maxGuests')).toBe(true);

        // Test invalid types
        const invalidPriceDto = createDto({ pricePerNight: 'not-a-number' });
        const { errors: priceTypeErrors } = await validateDto(invalidPriceDto);
        expect(priceTypeErrors.length).toBeGreaterThan(0);
        expect(priceTypeErrors.some(error => error.property === 'pricePerNight')).toBe(true);

        const invalidMaxGuestsDto = createDto({ maxGuests: 'not-a-number' });
        const { errors: maxGuestsTypeErrors } = await validateDto(invalidMaxGuestsDto);
        expect(maxGuestsTypeErrors.length).toBeGreaterThan(0);
        expect(maxGuestsTypeErrors.some(error => error.property === 'maxGuests')).toBe(true);

        const invalidDisplayOrderDto = createDto({ displayOrder: 'not-a-number' });
        const { errors: displayOrderTypeErrors } = await validateDto(invalidDisplayOrderDto);
        expect(displayOrderTypeErrors.length).toBeGreaterThan(0);
        expect(displayOrderTypeErrors.some(error => error.property === 'displayOrder')).toBe(true);

        // Test invalid values
        const negativePriceDto = createDto({ pricePerNight: -10 });
        const { errors: negativePriceErrors } = await validateDto(negativePriceDto);
        expect(negativePriceErrors.length).toBeGreaterThan(0);
        expect(negativePriceErrors.some(error => error.property === 'pricePerNight')).toBe(true);

        const zeroMaxGuestsDto = createDto({ maxGuests: 0 });
        const { errors: zeroMaxGuestsErrors } = await validateDto(zeroMaxGuestsDto);
        expect(zeroMaxGuestsErrors.length).toBeGreaterThan(0);
        expect(zeroMaxGuestsErrors.some(error => error.property === 'maxGuests')).toBe(true);

        const zeroDisplayOrderDto = createDto({ displayOrder: 0 });
        const { errors: zeroDisplayOrderErrors } = await validateDto(zeroDisplayOrderDto);
        expect(zeroDisplayOrderErrors.length).toBeGreaterThan(0);
        expect(zeroDisplayOrderErrors.some(error => error.property === 'displayOrder')).toBe(true);

        // Test invalid URL
        const invalidUrlDto = createDto({ imageUrl: 'not-a-url' });
        const { errors: urlErrors } = await validateDto(invalidUrlDto);
        expect(urlErrors.length).toBeGreaterThan(0);
        expect(urlErrors.some(error => error.property === 'imageUrl')).toBe(true);

        // Test invalid amenities
        const invalidAmenitiesDto = createDto({ amenities: 123 });
        const { errors: amenitiesErrors } = await validateDto(invalidAmenitiesDto);
        expect(amenitiesErrors.length).toBeGreaterThan(0);
        expect(amenitiesErrors.some(error => error.property === 'amenities')).toBe(true);
      });
    });

    describe('transformation', () => {
      it('should transform all data types correctly', () => {
        // Test string to number transformation
        const stringToNumberDto = createDto({
          pricePerNight: '150',
          maxGuests: '2',
          displayOrder: '1',
        });
        expect(typeof stringToNumberDto.pricePerNight).toBe('number');
        expect(stringToNumberDto.pricePerNight).toBe(150);
        expect(typeof stringToNumberDto.maxGuests).toBe('number');
        expect(stringToNumberDto.maxGuests).toBe(2);
        expect(typeof stringToNumberDto.displayOrder).toBe('number');
        expect(stringToNumberDto.displayOrder).toBe(1);

        // Test amenities transformation from string to array
        const stringAmenitiesDto = createDto({
          amenities: '["wifi", "tv", "minibar"]',
        });
        expect(Array.isArray(stringAmenitiesDto.amenities)).toBe(true);
        expect(stringAmenitiesDto.amenities).toEqual(['wifi', 'tv', 'minibar']);

        // Test amenities transformation with single string value
        const singleAmenityDto = createDto({
          amenities: 'wifi',
        });
        expect(Array.isArray(singleAmenityDto.amenities)).toBe(true);
        expect(singleAmenityDto.amenities).toEqual(['wifi']);

        // Test undefined values
        const undefinedValuesDto = createDto({
          imageUrl: undefined,
          displayOrder: undefined,
          amenities: undefined,
        });
        expect(undefinedValuesDto.imageUrl).toBeUndefined();
        expect(undefinedValuesDto.displayOrder).toBeUndefined();
        expect(undefinedValuesDto.amenities).toBeUndefined();

        // Test null values
        const nullValuesDto = createDto({
          imageUrl: null,
          displayOrder: null,
          amenities: null,
        });
        expect(nullValuesDto.imageUrl).toBeNull();
        expect(nullValuesDto.displayOrder).toBeNull();
        expect(nullValuesDto.amenities).toBeNull();

        // Test empty values
        const emptyValuesDto = createDto({
          name: '',
          code: '',
          description: '',
          pricePerNight: '',
          maxGuests: '',
          imageUrl: '',
          displayOrder: '',
          amenities: '',
        });
        expect(emptyValuesDto.name).toBe('');
        expect(emptyValuesDto.code).toBe('');
        expect(emptyValuesDto.description).toBe('');
        expect(emptyValuesDto.pricePerNight).toBe('');
        expect(emptyValuesDto.maxGuests).toBe('');
        expect(emptyValuesDto.imageUrl).toBe('');
        expect(emptyValuesDto.displayOrder).toBe('');
        expect(emptyValuesDto.amenities).toEqual(['']);
      });
    });
  });

  describe('UpdateRoomTypeDto', () => {
    const createDto = (data = {}) => plainToClass(UpdateRoomTypeDto, data);

    const validateDto = async (dto: UpdateRoomTypeDto) => {
      const errors = await validate(dto);
      return { errors, hasErrors: errors.length > 0 };
    };

    describe('validation', () => {
      it('should validate all fields correctly', async () => {
        // Test empty update (no fields)
        const emptyDto = createDto({});
        const { errors: emptyErrors } = await validateDto(emptyDto);
        expect(emptyErrors.length).toBe(0);

        // Test single field update
        const singleFieldDto = createDto({ name: 'Updated Room Type' });
        const { errors: singleFieldErrors } = await validateDto(singleFieldDto);
        expect(singleFieldErrors.length).toBe(0);

        // Test multiple fields update
        const multipleFieldsDto = createDto({
          name: 'Updated Room Type',
          code: 'updated-code',
          pricePerNight: 200,
        });
        const { errors: multipleFieldsErrors } = await validateDto(multipleFieldsDto);
        expect(multipleFieldsErrors.length).toBe(0);

        // Test all fields update
        const allFieldsDto = createDto({
          name: 'Updated Room Type',
          code: 'updated-code',
          description: 'Updated description',
          pricePerNight: 200,
          maxGuests: 3,
          imageUrl: 'https://example.com/updated.jpg',
          displayOrder: 2,
          amenities: ['wifi', 'tv', 'minibar', 'jacuzzi'],
        });
        const { errors: allFieldsErrors } = await validateDto(allFieldsDto);
        expect(allFieldsErrors.length).toBe(0);

        // Test invalid types
        const invalidPriceDto = createDto({ pricePerNight: 'not-a-number' });
        const { errors: priceTypeErrors } = await validateDto(invalidPriceDto);
        expect(priceTypeErrors.length).toBeGreaterThan(0);
        expect(priceTypeErrors.some(error => error.property === 'pricePerNight')).toBe(true);

        const invalidMaxGuestsDto = createDto({ maxGuests: 'not-a-number' });
        const { errors: maxGuestsTypeErrors } = await validateDto(invalidMaxGuestsDto);
        expect(maxGuestsTypeErrors.length).toBeGreaterThan(0);
        expect(maxGuestsTypeErrors.some(error => error.property === 'maxGuests')).toBe(true);

        // Test invalid values
        const negativePriceDto = createDto({ pricePerNight: -10 });
        const { errors: negativePriceErrors } = await validateDto(negativePriceDto);
        expect(negativePriceErrors.length).toBeGreaterThan(0);
        expect(negativePriceErrors.some(error => error.property === 'pricePerNight')).toBe(true);

        const zeroMaxGuestsDto = createDto({ maxGuests: 0 });
        const { errors: zeroMaxGuestsErrors } = await validateDto(zeroMaxGuestsDto);
        expect(zeroMaxGuestsErrors.length).toBeGreaterThan(0);
        expect(zeroMaxGuestsErrors.some(error => error.property === 'maxGuests')).toBe(true);

        // Test invalid URL
        const invalidUrlDto = createDto({ imageUrl: 'not-a-url' });
        const { errors: urlErrors } = await validateDto(invalidUrlDto);
        expect(urlErrors.length).toBeGreaterThan(0);
        expect(urlErrors.some(error => error.property === 'imageUrl')).toBe(true);

        // Test invalid amenities
        const invalidAmenitiesDto = createDto({ amenities: 123 });
        const { errors: amenitiesErrors } = await validateDto(invalidAmenitiesDto);
        expect(amenitiesErrors.length).toBeGreaterThan(0);
        expect(amenitiesErrors.some(error => error.property === 'amenities')).toBe(true);
      });
    });

    describe('transformation', () => {
      it('should transform all data types correctly', () => {
        // Test string to number transformation
        const stringToNumberDto = createDto({
          pricePerNight: '200',
          maxGuests: '3',
          displayOrder: '2',
        });
        expect(typeof stringToNumberDto.pricePerNight).toBe('number');
        expect(stringToNumberDto.pricePerNight).toBe(200);
        expect(typeof stringToNumberDto.maxGuests).toBe('number');
        expect(stringToNumberDto.maxGuests).toBe(3);
        expect(typeof stringToNumberDto.displayOrder).toBe('number');
        expect(stringToNumberDto.displayOrder).toBe(2);

        // Test amenities transformation from string to array
        const stringAmenitiesDto = createDto({
          amenities: '["wifi", "tv", "minibar", "jacuzzi"]',
        });
        expect(Array.isArray(stringAmenitiesDto.amenities)).toBe(true);
        expect(stringAmenitiesDto.amenities).toEqual(['wifi', 'tv', 'minibar', 'jacuzzi']);

        // Test amenities transformation with single string value
        const singleAmenityDto = createDto({
          amenities: 'wifi',
        });
        expect(Array.isArray(singleAmenityDto.amenities)).toBe(true);
        expect(singleAmenityDto.amenities).toEqual(['wifi']);

        // Test undefined values
        const undefinedValuesDto = createDto({
          name: undefined,
          code: undefined,
          description: undefined,
          pricePerNight: undefined,
          maxGuests: undefined,
          imageUrl: undefined,
          displayOrder: undefined,
          amenities: undefined,
        });
        expect(undefinedValuesDto.name).toBeUndefined();
        expect(undefinedValuesDto.code).toBeUndefined();
        expect(undefinedValuesDto.description).toBeUndefined();
        expect(undefinedValuesDto.pricePerNight).toBeUndefined();
        expect(undefinedValuesDto.maxGuests).toBeUndefined();
        expect(undefinedValuesDto.imageUrl).toBeUndefined();
        expect(undefinedValuesDto.displayOrder).toBeUndefined();
        expect(undefinedValuesDto.amenities).toBeUndefined();

        // Test null values
        const nullValuesDto = createDto({
          name: null,
          code: null,
          description: null,
          pricePerNight: null,
          maxGuests: null,
          imageUrl: null,
          displayOrder: null,
          amenities: null,
        });
        expect(nullValuesDto.name).toBeNull();
        expect(nullValuesDto.code).toBeNull();
        expect(nullValuesDto.description).toBeNull();
        expect(nullValuesDto.pricePerNight).toBeNull();
        expect(nullValuesDto.maxGuests).toBeNull();
        expect(nullValuesDto.imageUrl).toBeNull();
        expect(nullValuesDto.displayOrder).toBeNull();
        expect(nullValuesDto.amenities).toBeNull();

        // Test partial update
        const partialUpdateDto = createDto({
          name: 'Partial Update',
          pricePerNight: 250,
        });
        expect(partialUpdateDto.name).toBe('Partial Update');
        expect(partialUpdateDto.pricePerNight).toBe(250);
        expect(partialUpdateDto.code).toBeUndefined();
        expect(partialUpdateDto.description).toBeUndefined();
        expect(partialUpdateDto.maxGuests).toBeUndefined();
        expect(partialUpdateDto.imageUrl).toBeUndefined();
        expect(partialUpdateDto.displayOrder).toBeUndefined();
        expect(partialUpdateDto.amenities).toBeUndefined();
      });
    });
  });
}); 