export class computeIncomeDto {
    exemptions:number[];
    grossIncome:number
}

export class ResponseDto {
    cra:number;
    totalTaxableIncome:number;
    monthlyTax:number
}