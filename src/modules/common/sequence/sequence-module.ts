import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SequenceModel, SequenceSchema } from 'src/modules/common/sequence/sequence.model';
import { SequenceService } from 'src/modules/common/sequence/sequence-service';

@Module({
  imports: [MongooseModule.forFeature([{ name: SequenceModel.modelName, schema: SequenceSchema }])],
  providers: [SequenceService],
  exports: [SequenceService],
})
export class SequenceModule {}
