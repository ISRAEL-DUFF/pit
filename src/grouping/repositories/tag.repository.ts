import { EntityRepository } from "@mikro-orm/postgresql"
import { Tag } from "src/entities/Tag.entity"
import { TagEntity } from "src/entities/TagEntity.entity"
import { ITagEntity } from "../interfaces/tag"

export class TagRepository extends EntityRepository<Tag> {

    addEntity(entity: ITagEntity): void {
        const tagEntity = new TagEntity()
        tagEntity.entityId = entity.id
        // this.em.entities.add(tagEntity)
        this.em.persistAndFlush(this)
    }
}