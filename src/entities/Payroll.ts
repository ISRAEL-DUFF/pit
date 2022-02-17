import { Property, Entity, OneToOne, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Payslip } from "./Payslip";

@Entity()
export class Payroll extends BaseEntity {
    @Property()
    organisationWalletId: number;

    // @Property()
    // reportId: number

    @Property()
    executed = false;

    @Property()
    dateGenerated: Date

    @Property()
    payrollYear: String

    @Property()
    payrollMonth: String

    @OneToMany(() => Payslip, payslip => payslip.id)
    payslips = new Collection<Payslip>(this)

    constructor() {
        super()
    }
}