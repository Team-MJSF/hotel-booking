import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRoomTypes1710091500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the room_types table
    await queryRunner.createTable(
      new Table({
        name: 'room_types',
        columns: [
          {
            name: 'room_type_id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'price_per_night',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'max_guests',
            type: 'integer',
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'amenities',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'display_order',
            type: 'integer',
            default: 1,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indices
    await queryRunner.createIndex(
      'room_types',
      new TableIndex({
        name: 'IDX_ROOM_TYPES_CODE',
        columnNames: ['code'],
      }),
    );

    await queryRunner.createIndex(
      'room_types',
      new TableIndex({
        name: 'IDX_ROOM_TYPES_DISPLAY_ORDER',
        columnNames: ['display_order'],
      }),
    );

    // Create a trigger to automatically update the updated_at column on update
    await queryRunner.query(`
      CREATE TRIGGER update_room_types_timestamp 
      AFTER UPDATE ON room_types 
      FOR EACH ROW 
      BEGIN 
        UPDATE room_types SET updated_at = CURRENT_TIMESTAMP WHERE room_type_id = OLD.room_type_id; 
      END
    `);

    // Seed initial room types with amenities
    await queryRunner.query(`
      INSERT INTO room_types (name, code, description, price_per_night, max_guests, image_url, amenities, display_order)
      VALUES 
        ('Standard Room', 'standard', 'Comfortable room with all the essential amenities for a pleasant stay.', 14900, 2, '/images/standard-room.jpg', 
        '["Free WiFi", "Queen-Size Bed", "TV", "Private Bathroom", "Air Conditioning"]', 1),
        
        ('Executive Room', 'executive', 'Modern room with work area, queen-size bed, and premium toiletries.', 19900, 2, '/images/executive-room.jpg', 
        '["Free WiFi", "Queen-Size Bed", "Smart TV", "Work Desk", "Coffee Maker", "Air Conditioning", "Private Bathroom"]', 2),
        
        ('Family Suite', 'family', 'Perfect for families with two bedrooms, living area, and kid-friendly amenities.', 34900, 4, '/images/family-suite.jpg', 
        '["Free WiFi", "Multiple Beds", "Smart TV", "Kitchenette", "Balcony", "Air Conditioning", "Two Bathrooms", "Living Room"]', 3),
        
        ('Deluxe Suite', 'deluxe', 'Spacious suite with city views, king-size bed, and luxury amenities.', 29900, 2, '/images/deluxe-suite.jpg', 
        '["Free WiFi", "King-Size Bed", "Smart TV", "Mini Bar", "Luxury Bathroom", "Air Conditioning", "Room Service", "City View"]', 4),
        
        ('Premium Suite', 'premium', 'Luxurious suite with separate living area, premium amenities, and stunning views.', 39900, 3, '/images/premium-suite.jpg', 
        '["Free WiFi", "King-Size Bed", "Smart TV", "Jacuzzi", "Butler Service", "Ocean View", "Living Room", "Mini Bar"]', 5)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the triggers
    await queryRunner.query('DROP TRIGGER IF EXISTS update_room_types_timestamp');

    // Drop the table
    await queryRunner.dropTable('room_types');
  }
} 