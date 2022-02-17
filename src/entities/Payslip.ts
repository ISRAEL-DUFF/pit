import { Property, Entity, OneToOne, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Beneficiary } from "./Beneficiary";
import { PayBreakdown } from "./PayBreakdown";

@Entity()
export class Payslip extends BaseEntity {
    @Property()
    grossPay: number;

    @Property()
    netPay!: number;

    // @Property()
    // beneficiaryId: number;

    @Property()
    payrollId: number;

    @OneToMany(() => PayBreakdown, payBreakdown => payBreakdown.id)
    salaryBreakdown = new Collection<PayBreakdown>(this)

    @OneToOne(() => Beneficiary, beneficiary => beneficiary.id, {owner: true, orphanRemoval: true})
    beneficiary: Beneficiary


    constructor(grossPay: number, 
        payrollId: number, beneficiary: Beneficiary) {
        super()
        this.grossPay = grossPay
        this.payrollId = payrollId
        this.beneficiary = beneficiary
    }
}