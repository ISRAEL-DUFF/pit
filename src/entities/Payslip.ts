import { Property, Entity, OneToOne, OneToMany, Collection, ManyToOne } from "@mikro-orm/core";
import { PayslipInput } from "../common/data.input";
import { BaseEntity } from "./BaseEntity";
import { PayrollBeneficiary } from "./PayrollBeneficiary";
import { PayBreakdown } from "./PayBreakdown";
import { Payroll } from "./Payroll";

@Entity()
export class Payslip extends BaseEntity {
    @ManyToOne(() => Payroll)
    payroll: Payroll

    @OneToMany(() => PayBreakdown, payBreakdown => payBreakdown.payslip)
    salaryBreakdown = new Collection<PayBreakdown>(this)

    @OneToOne(() => PayrollBeneficiary, payrollBeneficiary => payrollBeneficiary.payslip, {owner: true, orphanRemoval: true})
    payrollBeneficiary: PayrollBeneficiary

    @Property()
    grossPay!: number;

    @Property()
    netPay!: number;

    constructor({grossPay, payroll, payrollBeneficiary}: PayslipInput) {
        super()
        this.grossPay = grossPay
        this.payroll = payroll
        this.payrollBeneficiary = payrollBeneficiary
    }
}