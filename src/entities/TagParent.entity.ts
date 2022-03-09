import { Property, Entity, OneToOne, OneToMany, Collection, ManyToOne } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Tag } from "./Tag.entity";

@Entity()
export class TagParent extends BaseEntity{
    @ManyToOne(() => Tag)
    tag!: Tag

    @Property() 
    parentId!: String

    constructor() {
        super();
    }
}