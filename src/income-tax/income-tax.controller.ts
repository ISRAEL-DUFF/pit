import { Controller, Get, Post } from "@nestjs/common";
import { IncomeTaxService } from "./income-tax.service";

@Controller('tax')
export class IncomeTaxController {
    constructor(private incomeTaxService: IncomeTaxService) {}
    @Get()
    incomeTax(): number {
        return this.incomeTaxService.computeTaxableIncome(3000000, [1, 1, 1]);
    }

    @Get('per/anum')
    incomeTaxPerAnum(): number {
        return this.incomeTaxService.computeAnualTaxPerAnum(3000000, [1, 1, 1]);
    }
}