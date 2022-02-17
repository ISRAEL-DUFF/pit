import { Property, Entity, OneToOne, OneToMany, Collection } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Payroll } from "./Payroll";

@Entity()
export class Beneficiary extends BaseEntity {
    @Property()
    employeeWalletId: number

    @Property()
    bankName: String

    @Property()
    accountName: String

    @Property()
    accountNum: String

    @Property()
    optInPension = false

    @Property()
    optInNhif = false

    @Property()
    optInNhf = false
}