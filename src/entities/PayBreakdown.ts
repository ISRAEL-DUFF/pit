// import { Property, Entity } from "@mikro-orm/core";
import { Property, Entity, OneToOne, OneToMany, Collection, ManyToOne } from "@mikro-orm/core";
import { PayBreakdownInput } from "../common/data.input";
import { BaseEntity } from "./BaseEntity";
import { Payslip } from "./Payslip";

@Entity()
export class PayBreakdown extends BaseEntity{
    @ManyToOne(() => Payslip)
    payslip!: Payslip

    @Property() 
    description!: String

    @Property()
    amount!: number

    constructor(payBreakdown: PayBreakdownInput) {
        super();
        this.amount = payBreakdown.amount;
        this.description = payBreakdown.description;
    }
}