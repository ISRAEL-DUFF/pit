import { Body, Controller, Get, Post } from "@nestjs/common";
import { IncomeTaxService } from "./income-tax.service";
import { computeIncomeDto, ResponseDto } from "./dto/income.dto";

@Controller('tax')
export class IncomeTaxController {
    constructor(private incomeTaxService: IncomeTaxService) {}
    @Post()
    incomeTax(@Body() body: any): number {
        // console.log('BODY:', body)
        let b = [body.exemptions['c1'], body.exemptions['c2'], body.exemptions['c3']]
        // return this.incomeTaxService.computeTaxableIncome(3000000, [1, 1, 1]);
        return this.incomeTaxService.computeTaxableIncome(body.a, b);
    }

    @Post('per/anum')
    incomeTaxPerAnum(@Body() body: computeIncomeDto): ResponseDto {
        return {
            cra: this.incomeTaxService.cra(body.grossIncome),
            totalTaxableIncome: this.incomeTaxService.computeTaxableIncome(body.grossIncome, body.exemptions),
            monthlyTax: this.incomeTaxService.
            computeAnualTaxPerAnum(body.grossIncome, body.exemptions)
        }
        // return this.incomeTaxService.computeAnualTaxPerAnum(3000000, [1, 1, 1]);
    }
}