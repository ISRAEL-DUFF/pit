import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class BaseEntity {
    @PrimaryKey()
    id: number;
}