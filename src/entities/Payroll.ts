import { Property, Entity, OneToOne, OneToMany, Collection, ManyToOne } from "@mikro-orm/core";
import { PayrollInput } from "../common/data.input";
import { BaseEntity } from "./BaseEntity";
import { Payslip } from "./Payslip";
import { PayrollReport } from "./PayrollReport";

@Entity()
export class Payroll extends BaseEntity {
    @OneToMany(() => Payslip, payslip => payslip.payroll)
    payslips = new Collection<Payslip>(this)

    @ManyToOne()
    report?: PayrollReport

    @Property()
    organisationWalletId!: String;
 
    @Property()
    executed = false;

    @Property()
    payrollYear!: String

    @Property()
    payrollMonth!: String

    // mini payroll summary
    @Property()
    totalNumberOfEmployees: number

    @Property()
    totalGrossSalary: number

    @Property()
    totalNetSalary: number

    constructor(payroll: PayrollInput) {
        super()
        this.organisationWalletId = payroll.organisationalWalletId
        this.payrollMonth = payroll.payrollMonth
        this.payrollYear = payroll.payrollYear
    }
}