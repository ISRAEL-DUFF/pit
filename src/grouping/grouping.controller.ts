import { Controller , Post, Body, Get, Param} from "@nestjs/common";
import { GroupingService } from "./grouping.service";

@Controller('group')
export class GroupingController {

    constructor(private readonly groupingService: GroupingService) {}

    @Post('create/tag')
    createdTag(@Body() body: any): any {
        return this.groupingService.createTag({
            name: body.name,
            description: body.description
        })
    }

    @Get('get/:name')
    async getTag(@Param() q: any): Promise<any> {
        // await this.groupingService.initTestingFunc()
        // await this.groupingService.playground()
        return await this.groupingService.query(q.name)
    }

}