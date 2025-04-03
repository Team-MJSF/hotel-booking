import { PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';

/**
 * Data Transfer Object for updating an existing room
 * Extends CreateRoomDto but makes all fields optional
 * This allows partial updates of room information
 */
export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
