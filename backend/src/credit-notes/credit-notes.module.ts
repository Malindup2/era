import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditNotesService } from './credit-notes.service';
import { CreditNotesController } from './credit-notes.controller';
import { CreditNote } from './entities/credit-note.entity';
import { CreditNoteLineItem } from './entities/credit-note-line-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditNote, CreditNoteLineItem])],
  controllers: [CreditNotesController],
  providers: [CreditNotesService],
  exports: [CreditNotesService],
})
export class CreditNotesModule {}
