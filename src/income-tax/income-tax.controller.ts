import { Body, Controller, Get, Post } from "@nestjs/common";
import { IncomeTaxService } from "./income-tax.service";
import { computeIncomeDto, ResponseDto } from "./dto/income.dto";

import { InjectRepository} from "@mikro-orm/nestjs";
import { QueryOrder, wrap } from '@mikro-orm/core'
import { PayBreakdown } from "src/entities/PayBreakdown";
import { EntityRepository } from "@mikro-orm/mysql";

@Controller('tax')
export class IncomeTaxController {
    constructor(private incomeTaxService: IncomeTaxService, @InjectRepository(PayBreakdown) private readonly payBreakdownRepository: EntityRepository<PayBreakdown>) {}
    @Post()
    incomeTax(@Body() body: any): number {
        // console.log('BODY:', body)
        let b = [body.exemptions['c1'], body.exemptions['c2'], body.exemptions['c3']]
        // return this.incomeTaxService.computeTaxableIncome(3000000, [1, 1, 1]);
        return this.incomeTaxService.computeTaxableIncome(body.a, b);
    }

    @Post('per/anum')
    async incomeTaxPerAnum(@Body() body: computeIncomeDto): Promise<ResponseDto> {
        const payBreakdown = new PayBreakdown("Test Breakdonw", 4000);

        // persist 
        wrap(payBreakdown).assign(payBreakdown);
        await this.payBreakdownRepository.persistAndFlush(payBreakdown);

        // or do it like this
        // await this.payBreakdownRepository.persist(payBreakdown)
        // await this.payBreakdownRepository.flush()


        return {
            cra: this.incomeTaxService.cra(body.grossIncome),
            totalTaxableIncome: this.incomeTaxService.computeTaxableIncome(body.grossIncome, body.exemptions),
            monthlyTax: this.incomeTaxService.
            computeAnualTaxPerAnum(body.grossIncome, body.exemptions)
        }
        // return this.incomeTaxService.computeAnualTaxPerAnum(3000000, [1, 1, 1]);
    }


    // @Post()
    // async create(@Body() body: any) {
    //     if (!body.name || !body.email) {
    //     throw new HttpException('One of `name, email` is missing', HttpStatus.BAD_REQUEST);
    //     }

    //     const author = new Author(body.name, body.email);
    //     wrap(author).assign(body);
    //     await this.authorRepository.persist(author);

    //     return author;
    // }


    @Get('test') 
    async testDb(): Promise<PayBreakdown[]> {
        return this.payBreakdownRepository.findAll()
    }
}