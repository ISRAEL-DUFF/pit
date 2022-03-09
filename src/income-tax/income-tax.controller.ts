import { Body, Controller, Get, Post } from "@nestjs/common";
import { IncomeTaxService } from "./income-tax.service";
import { computeIncomeDto, ResponseDto } from "./dto/income.dto";

import { InjectRepository} from "@mikro-orm/nestjs";
import { QueryOrder, wrap } from '@mikro-orm/core'
import { PayBreakdown } from "src/entities/PayBreakdown";
import { EntityManager, EntityRepository } from "@mikro-orm/mysql";
import { BeneficiaryInput } from "src/common/data.input";
import { PayrollBeneficiary } from "src/entities/PayrollBeneficiary";

@Controller('tax')
export class IncomeTaxController {
    constructor(private incomeTaxService: IncomeTaxService, private readonly em: EntityManager, @InjectRepository(PayBreakdown) private readonly payBreakdownRepository: EntityRepository<PayBreakdown>) {}
    @Post()
    incomeTax(@Body() body: any): number {
        let b = [body.exemptions['c1'], body.exemptions['c2'], body.exemptions['c3']]
        return this.incomeTaxService.computeTaxableIncome(body.a, b);
    }

    @Post('per/anum')
    async incomeTaxPerAnum(@Body() body: computeIncomeDto): Promise<ResponseDto> {
        // const payBreakdown = new PayBreakdown({
        //     description: "Test Breakdonw", 
        //     amount: 4000
        // });

        // // persist 
        // wrap(payBreakdown).assign(payBreakdown);
        // await this.payBreakdownRepository.persistAndFlush(payBreakdown);

        // or do it like this
        // await this.payBreakdownRepository.persist(payBreakdown)
        // await this.payBreakdownRepository.flush()


        return {
            cra: this.incomeTaxService.cra(body.grossIncome),
            totalTaxableIncome: this.incomeTaxService.computeTaxableIncome(body.grossIncome, body.exemptions),
            monthlyTax: this.incomeTaxService.
            computeAnualTaxPerMonth(body.grossIncome, body.exemptions)
        }
    }

    @Post('beneficiary')
    async addBeneficiary(@Body() beneficiary: BeneficiaryInput): Promise<any> {
        const newBeneficiary = new PayrollBeneficiary(beneficiary)
        newBeneficiary.optInNhf = true
        newBeneficiary.optInPension = true;
        this.em.fork().persistAndFlush(newBeneficiary);

        return {
            success: true
        }
    }

    @Get('aggregate')
    async computePayroll(): Promise<void> {
        let payroll = await this.incomeTaxService.generatePayroll({
            organisationalWalletId: 'org_5434',
            payrollMonth: 'April',
            payrollYear: '2017'
        })
        console.log('payroll:', payroll);
    }

    @Post('execute')
    async executePayroll(@Body() body: any ): Promise<any> {
        let r = await this.incomeTaxService.executePayroll(body.payrollId)
    }


    @Get('test') 
    async testDb(): Promise<PayBreakdown[]> {
        return this.payBreakdownRepository.findAll()
    }
}