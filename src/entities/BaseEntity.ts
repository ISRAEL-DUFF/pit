import { v4 } from 'uuid';
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export abstract class BaseEntity {
    @PrimaryKey()
    id = v4()


 @Property({ columnType: "timestamptz", onCreate: () => new Date() })
  createdAt = new Date();

  @Property({
    nullable: true,
    onUpdate: () => new Date(),
    columnType: "timestamptz",
  })
  updatedAt?: Date;

  @Property({ nullable: true, columnType: "timestamptz" })
  deletedAt?: Date;
}