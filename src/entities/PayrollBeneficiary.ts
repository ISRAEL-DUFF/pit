import { Property, Entity, OneToOne, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Payslip } from "./Payslip";
import { BeneficiaryInput } from "../common/data.input";

@Entity()
export class PayrollBeneficiary extends BaseEntity {
    @OneToOne({mappedBy: 'payrollBeneficiary'})
    payslip: Payslip
 
    @Property()
    employeeWalletId: String

    @Property()
    monthlySalary!: number

    @Property()
    bankName: String

    @Property()
    accountName: String

    @Property()
    accountNum: String

    @Property()
    optInPension = false

    @Property()
    optInNhis = false

    @Property()
    optInNhf = false

    constructor({ accountName, bankName, accountNum, employeeWalletId, monthlySalary }: BeneficiaryInput ) {
        super()
        this.accountName = accountName
        this.bankName = bankName
        this.accountNum = accountNum
        this.employeeWalletId = employeeWalletId
        this.monthlySalary = monthlySalary
    }
}