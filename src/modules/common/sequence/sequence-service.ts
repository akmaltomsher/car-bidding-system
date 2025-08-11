import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { SequenceModel, SequenceDocument } from 'src/modules/common/sequence/sequence.model';

@Injectable()
export class SequenceService {
  private readonly logger = new Logger(SequenceService.name);

  constructor(
    @InjectModel(SequenceModel.modelName)
    private readonly sequenceModel: Model<SequenceDocument>,
  ) {}

  async getNextSequenceCode(sequenceId: string): Promise<number> {
    try {
      const sequenceDoc = await this.sequenceModel.findOneAndUpdate(
        { _id: sequenceId },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true },
      );

      if (sequenceDoc) {
        return sequenceDoc.sequenceValue;
      } else {
        throw new Error('Failed to generate user code.');
      }
    } catch (err) {
      this.logger.error('Error getting sequence:', err);
      throw new Error('Error generating user code.');
    }
  }
}
