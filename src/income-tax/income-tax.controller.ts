import { Body, Controller, Get, Post } from "@nestjs/common";
import { IncomeTaxService } from "./income-tax.service";

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
    incomeTaxPerAnum(@Body() body: any): number {
        let b = [body.exemptions['c1'], body.exemptions['c2'], body.exemptions['c3']]
        // return this.incomeTaxService.computeAnualTaxPerAnum(3000000, [1, 1, 1]);
        return this.incomeTaxService.computeAnualTaxPerAnum(body.a, b);
    }
}