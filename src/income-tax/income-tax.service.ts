import { Injectable } from "@nestjs/common";
import { EntityManager, EntityRepository } from "@mikro-orm/mysql";
import { PayBreakdown } from "src/entities/PayBreakdown";
import { Payroll } from "src/entities/Payroll";
import { PayrollBeneficiary } from "src/entities/PayrollBeneficiary";
import { Payslip } from "src/entities/Payslip";
import { GeneratePayrollInput } from "src/common/data.input";
import { PayrollReport } from "src/entities/PayrollReport";

@Injectable()
export class IncomeTaxService {
    constructor(private readonly em: EntityManager) {}

    // *********** PAYROLL CONSTANTS *************
    private readonly taxTable: number[] = [
        300000, 300000, 500000, 500000, 1600000, 3200000
    ];

    private readonly taxTablePercents: number[] = [
        0.07, 0.11, 0.15, 0.19, 0.21, 0.24
    ];
    private readonly exemptionTax: number[] = [0.08, 0.025, 0.05];
    private readonly exemptionTaxDescriptions: String[] = [
        "Pension (8% of gross income)",
    "National Housing Fund (2.5% of gross income)", 
    , "National Health Insurance Scheme (5% of gross income)"];
    private readonly C0 = 200000;   // fixed

    
    // *********** COMPUTATIONS AND ALGORITHMS *************
    private dotProduct(b:number[]): number {
        if(b.length < this.exemptionTax.length) return 0;   // you can also throw exception here
        var dotProduct:number = 0;
        for(var i = 0; i < this.exemptionTax.length; i++) {
            dotProduct += this.exemptionTax[i] * b[i];
        }
        return dotProduct;
    }

    private hadamardProduct(b:number[], scale: number = 1): number[] {
        if(b.length < this.exemptionTax.length) return [];   // you can also throw exception here
        var c:number[] = [];

        for(var i = 0; i < this.exemptionTax.length; i++) {
            c.push(this.exemptionTax[i] * b[i] * scale)
        }
        return c;
    }

    cra(grossIncom: number): number {
        return Math.max(grossIncom * 0.01, this.C0) + 0.2 * grossIncom
    }

    exemptionDeduction(grossIncome:number, b:number[]): number {
        var dotProduct:number = this.dotProduct(b);
        return grossIncome * dotProduct;
    }

    exemptionDeductionPerMonth(grossIncome:number, b:number[]): number[] {
        return this.hadamardProduct(b, (1/12) * grossIncome)
    }

    computeTaxableIncome(grossIncome:number, b:number[]): number {
        let exemptionsAndCRA = (this.exemptionDeduction(grossIncome, b) + this.cra(grossIncome));
        if(grossIncome < exemptionsAndCRA) return grossIncome
        return grossIncome - exemptionsAndCRA
    }

    computeAnualTaxPerMonth(grossIncome:number, b:number[]): number {
        var taxableIncome = this.computeTaxableIncome(grossIncome, b);
        var workingIncome = taxableIncome;
        var annualTax = 0;
        for(var i = 0; i < this.taxTable.length; i++) {
            if(this.taxTable[i] <= workingIncome) {
                annualTax += this.taxTable[i] * this.taxTablePercents[i]
                workingIncome -= this.taxTable[i]
            } else {
                annualTax += workingIncome * this.taxTablePercents[i];
                workingIncome = 0;
            }
        }

        if(workingIncome > 0) {
            annualTax += workingIncome * 0.24;
        }
        return annualTax / 12;
    }


    // *********** PAYROLL SERVICES *************
    getPayslip(beneficiary: PayrollBeneficiary, payroll: Payroll): Payslip {
        let choiceVector = []
        choiceVector.push(beneficiary.optInPension ? 1 : 0)
        choiceVector.push(beneficiary.optInNhf ? 1 : 0)
        choiceVector.push(beneficiary.optInNhis ? 1 : 0)

        let netSalary = Number(beneficiary.monthlySalary);
        let grossSalary = netSalary * 12

        // tax exemptions forms a paybreakdown
        let exemptions = this.exemptionDeductionPerMonth(grossSalary, choiceVector);

        // Compute the tax for this employee
        let tax = this.computeAnualTaxPerMonth(grossSalary, choiceVector)

        let payslip = new Payslip({
            grossPay: netSalary,
            payrollBeneficiary: beneficiary,
            payroll: payroll
        })

        // The first breakdown is: Tax Deduction
        netSalary -= tax
        payslip.salaryBreakdown.add(
            new PayBreakdown(
                {
                    description: 'Tax deduction',
                    amount: tax
                }
            )
        )

        // next, Tax exemption deductions
        for(let i = 0; i < exemptions.length; i++) {
            if(exemptions[i] > 0) {
                netSalary -= exemptions[i]
                payslip.salaryBreakdown.add(
                    new PayBreakdown(
                        {
                            description: this.exemptionTaxDescriptions[i],
                            amount: exemptions[i]
                        }
                    )
                )
            }
        }

        // deduct / add any other addons here
        
        //finally, set the net salary after all deductions have been made
        payslip.netPay = netSalary

        return payslip
    }

    async generatePayroll({ organisationalWalletId, payrollMonth, payrollYear }: GeneratePayrollInput) {
        let em = this.em.fork()
        let beneficiaries = await em.find(PayrollBeneficiary, {});
        let payroll: Payroll = new Payroll({
            organisationalWalletId,
            payrollMonth,
            payrollYear
        });

        let totalGrossSalary = 0;
        let totalNetSalary = 0;

        for(let b of beneficiaries) {
            let pslip = this.getPayslip(b, payroll)
            totalGrossSalary += Number(pslip.grossPay)
            totalNetSalary += Number(pslip.netPay)
            payroll.payslips.add(pslip)
        }

        // get or create payroll report
        let report = await em.findOne(PayrollReport, { reported: false })
        if(!report) {
            report = new PayrollReport()
            em.persist(report)
        }
        payroll.report = report
        payroll.totalNumberOfEmployees = beneficiaries.length
        payroll.totalGrossSalary = totalGrossSalary
        payroll.totalNetSalary = totalNetSalary
        
        em.persistAndFlush(payroll)
        return payroll
    }

    
   async executePayroll(payrollId: String): Promise<any> {
    let em = this.em.fork()
        let payroll = await em.findOne(Payroll, {
            id: payrollId,
            executed: false
        }, {
            populate: ['payslips']
        });

        if(payroll) {
            /*     
                Payroll execution logic here...

                for each payslip in payroll:
                    transfer fund from orgWallet to employeeWallet
                    schedule employeeWallet for bankTransfer
            */
            for(let payslip of payroll.payslips) {
                let transfered = await this.transferWalletFund(
                        payslip.payrollBeneficiary.employeeWalletId, 
                        payroll.organisationWalletId
                    )
                if(transfered) {
                    await this.scheduleForBankTransfer(
                        payslip.payrollBeneficiary.employeeWalletId, 
                        payroll.organisationWalletId
                    )
                }
            }
            payroll.executed = true
            em.persistAndFlush(payroll)
            return {
                executed: true
            }
        } else {
            console.log('payroll not found')
            return {
                executed: false
            }
        }
    }

    private async transferWalletFund(fromWalletId: String, toWalletId: String): Promise<boolean> {
        // TODO: some transfer logic here
        return true;
    }

    private async scheduleForBankTransfer(fromWalletId: String, toWalletId: String): Promise<boolean> {
        // TODO: schedule logic here
        return true;
    }

}