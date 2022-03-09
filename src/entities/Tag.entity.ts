import { Property, Entity, OneToOne, OneToMany, Collection, ManyToOne } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";
// import { TagChild } from "./TagChild.entity";
import { TagEntity } from "./TagEntity.entity";
// import { TagParent } from "./TagParent.entity";
import { TagRoute } from "./TagRoute.entity";

@Entity()
export class Tag extends BaseEntity {
    // @OneToMany(() => TagChild, tagChild => tagChild.tag)
    // children = new Collection<TagChild>(this)

    // @OneToMany(() => TagParent, parent => parent.tag)
    // parents = new Collection<TagParent>(this)

    // @OneToOne(() => TagEntity, entity => entity.tag, {owner: true, orphanRemoval: true})
    // tagEntity: TagEntity

    @OneToMany(() => TagEntity, tagEntity => tagEntity.tag)
    entities = new Collection<TagEntity>(this)
    
    @OneToMany(() => TagRoute, route => route.tag)
    routes = new Collection<TagRoute>(this)

    @Property({ unique: true })
    name!: String;

    @Property()
    description?: String;

    @Property()
    templateId?: String

    constructor() {
        super()
    }
}