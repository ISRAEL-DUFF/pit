import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export abstract class BaseEntity {
    @PrimaryKey()
    id: number;
}