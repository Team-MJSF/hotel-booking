import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { Room } from './entities/room.entity';
import { RoomType } from './entities/room-type.entity';
import { RoomTypesService } from './room-types.service';
import { RoomTypesController } from './room-types.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomType]),
  ],
  controllers: [RoomsController, RoomTypesController],
  providers: [RoomsService, RoomTypesService],
  exports: [RoomsService, RoomTypesService],
})
export class RoomsModule {}
