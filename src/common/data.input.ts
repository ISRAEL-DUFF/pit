import { Payroll } from "src/entities/Payroll"
import { PayrollBeneficiary } from "src/entities/PayrollBeneficiary"

export type BeneficiaryInput = {
    employeeWalletId: String,
    bankName: String,
    accountName: String,
    accountNum: String,
    monthlySalary: number
}

export type PayBreakdownInput = {
    description: String,
    amount: number
}

export type PayrollInput = {
    organisationalWalletId: String, 
    payrollYear: String, 
    payrollMonth: String 
}

export type PayslipInput = {
    grossPay: number, 
    payroll: Payroll, 
    payrollBeneficiary: PayrollBeneficiary
}

export type GeneratePayrollInput = {
    organisationalWalletId: String,
    payrollMonth: String,
    payrollYear: String
}