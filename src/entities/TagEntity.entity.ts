import { Property, Entity, OneToOne, OneToMany, Collection, ManyToOne } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
import { Tag } from "./Tag.entity";

@Entity()
export class TagEntity extends BaseEntity{
    // @OneToOne({mappedBy: 'tagEntity'})
    // tag: Tag
    @ManyToOne(() => Tag)
    tag!: Tag

    @Property() 
    entityId!: String

    constructor() {
        super();
    }
}