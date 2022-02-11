import { Property, Entity } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class PayBreakdown extends BaseEntity{
    @Property() 
    description!: String

    @Property()
    amount!: number

    constructor(description: String, amount: number) {
        super();
        this.amount = amount;
        this.description = description;
    }
}