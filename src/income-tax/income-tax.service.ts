import { Injectable } from "@nestjs/common";

@Injectable()
export class IncomeTaxService {
    private readonly exemptionTax: number[] = [0.08, 0.025, 0.05];
    private readonly C0 = 200000;   // fixed

    private readonly taxTable: number[] = [
        300000, 300000, 500000, 500000, 1600000, 3200000
    ];

    private readonly taxTablePercents: number[] = [
        0.07, 0.11, 0.15, 0.19, 0.21, 0.24
    ];

    private dotProduct(b:number[]): number {
        if(b.length < this.exemptionTax.length) return 0;   // you can also throw exception here
        var dotProduct:number = 0;
        for(var i = 0; i < this.exemptionTax.length; i++) {
            dotProduct += this.exemptionTax[i] * b[i];
        }
        return dotProduct;
    }
    cra(grossIncom: number): number {
        return Math.max(grossIncom * 0.01, this.C0) + 0.2 * grossIncom
    }

    exemptionDeduction(grossIncome:number, b:number[]): number {
        var dotProduct:number = this.dotProduct(b);
        return grossIncome * dotProduct;
    }

    computeTaxableIncome(grossIncome:number, b:number[]): number {
        return grossIncome - (this.exemptionDeduction(grossIncome, b) + this.cra(grossIncome))
    }

    computeAnualTaxPerAnum(grossIncome:number, b:number[]): number {
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


}