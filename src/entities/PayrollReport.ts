import { Property, Entity, OneToOne, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Payroll } from "./Payroll";

@Entity()
export class PayrollReport extends BaseEntity {
    @OneToMany(() => Payroll, payroll => payroll.report)
    payroll = new Collection<Payroll>(this)
    
    @Property()
    description?: String

    @Property()
    reported = false
}