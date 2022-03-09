import { Module } from '@nestjs/common'
import { GroupingService } from './grouping.service'
import { GroupingController } from './grouping.controller'

@Module({
    controllers: [GroupingController],
    providers: [GroupingService],
    imports: []
})
export class GroupingModule {}