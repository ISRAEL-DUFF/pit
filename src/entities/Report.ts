import { Property, Entity, OneToOne, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Payroll } from "./Payroll";

@Entity()
export class Report extends BaseEntity {
    @Property()
    dateGenerated: Date

    @Property()
    description: String

    @OneToMany(() => Payroll, payroll => payroll.id)
    payroll = new Collection<Payroll>(this)
}