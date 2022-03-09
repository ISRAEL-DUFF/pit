import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/mysql";
import { Populate } from "@mikro-orm/core";
import { Tag as Group, ITagEntity, TagOptions, TagIntent, TagIntentOptions, mockTagNamesDb, mockTagsDb, IResolverFunction } from "./interfaces/tag";
import { TagRoute } from '../entities/TagRoute.entity'
import { Tag } from '../entities/Tag.entity'
import { wrap } from "@mikro-orm/core";
// import { TagChild } from "src/entities/TagChild.entity";
// import { TagParent } from "src/entities/TagParent.entity";
import { TagRelation } from "src/entities/TagRelation.entity";
import { TagEntity } from "src/entities/TagEntity.entity";
// import { find } from "rxjs";
// import { v4 } from 'uuid';


type MyTemplate1 = {
    products: string[],
    discounts: number[]
}

type MyTemplate2 = {
    users: string[]
}

type MyUser = {
    id: string,
    name: string,
    templates?: string[]
}

let users: MyUser[] = [
    {
        id: 'user1',
        name: 'Name User 1'
    },

    {
        id: 'user2',
        name: 'Name User 2'
    },
    {
        id: 'user3',
        name: 'Name User 3'
    },
    {
        id: 'user4',
        name: 'Name User 4'
    },

    {
        id: 'user5',
        name: 'Name User 5'
    }
]


@Injectable()
export class GroupingService {
    inited: boolean = false // remove, just testing
    constructor(private readonly em: EntityManager) {}

    async createTag(options: any): Promise<any> {
        let em = this.em.fork()
        const opt = {
            name: options.name,
            description: options.description
        } as TagOptions

        // check if name already exist in the system
        const names = options.name.split(':')
        // const name = names[names.length - 1]
        let n = ''
        for(let i = 0; i < names.length - 1; i++) {
            if(n === '') n = names[i]
            else n += `:` + names[i]
            
            let tag = await em.findOne(TagRoute, {routeName: n})
            if(!tag) return {
                    success: false,
                    message: `Parent ${n} tag does not exist`
                }
        }
        let tagRoute = await em.findOne(TagRoute, {routeName: opt.name})
        if(tagRoute) return {
            success: false,
            message: 'Tag name already exists'
        }

        let parent = await this.query(n)
        let newTag = new Tag()
        if(parent) {
            newTag.name = opt.name
            newTag.description = opt.description
            newTag.templateId = opt.templateObject
            
            // set parent / child relationship
            const tagRelation = new TagRelation()
            tagRelation.childId = newTag.id
            tagRelation.parentId = parent.id

            em.persist(newTag)
            em.persist(tagRelation)
        } else {
            newTag.name = opt.name
            newTag.description = opt.description
            em.persist(newTag)
        }

        const newTagRoute = new TagRoute()
        newTagRoute.routeName = opt.name
        newTagRoute.tag = newTag
        await em.persistAndFlush(newTagRoute)

        return {
            success: true,
            message: 'Successfully created tag'
        }
    }

    async query(name: string): Promise<Group> {
        let em = this.em.fork()
        const tagRoute = await em.findOne(TagRoute, {routeName: name})
        let wrappedTag = wrap(tagRoute)
        if(wrappedTag) await wrappedTag.init()
        if(tagRoute) {
           await wrap(tagRoute.tag).init(true)
            const group = await this.tagIdToGroup(tagRoute.tag.id)
            group.children = await this.getChildren(tagRoute.tag.id)
            group.parents = await this.getParents(tagRoute.tag.id)
            return group

        }

    }

    async getChildren(tagId: string): Promise<Group[]> {
        const em = this.em.fork()
        let tags: Group[] = []
        const tag = await this.tagIdToGroup(tagId)
        const tagRelation = await em.find(TagRelation, { parentId: tagId })
        if(tagRelation) {
            for(let tr of tagRelation) {
                const childTagEntity = await em.findOne(Tag, { id: tr.childId })
                const t = this.tagEntityToGroup(childTagEntity)
                t.children = await this.getChildren(tr.childId)
                tags.push(t)
            }
            tag.children = tags
            return tag.children
        }
        else return tag.children
    }

    async getParents(tagId: string): Promise<Group[]> {
        const em = this.em.fork()
        let tags: Group[] = []
        const tag = await this.tagIdToGroup(tagId)
        const tagRelation = await em.find(TagRelation, { childId: tagId })
        if(tagRelation) {
            for(let tr of tagRelation) {
                const childTagEntity = await em.findOne(Tag, { id: tr.parentId })
                const t = this.tagEntityToGroup(childTagEntity)
                t.parents = await this.getParents(tr.parentId)
                tags.push(t)
            }
            tag.parents = tags
            return tag.parents
        }
        else return tag.parents
    }

    tagEntityToGroup(tag: Tag): Group {
        const entities:ITagEntity[] = []
        for(let e of tag.entities) {
            entities.push({
                id: e.entityId
            })
        }
        const g = new Group({
            id: tag.id,
            name: tag.name.toString(),
            description: tag.description?.toString(),
            templateObject: tag.templateId?.toString(),
        })
        g.entities = entities
        return g
    }

    async tagIdToGroup(tagId: string): Promise<Group> {
        const em = this.em.fork()
        const tag = await em.findOne(Tag, { id: tagId })
        return this.tagEntityToGroup(tag)
    }

    async addEntity(tagId: string, entity: ITagEntity): Promise<Group> {
        let em = this.em.fork()
        const tag = await em.findOne(Tag, { id: tagId })
        const tagEntityExists = await em.find(TagEntity, { entityId: entity.id, tag })
        if(tagEntityExists.length > 0) {
            // tag entity already exists here
            return
        }
        const tagEntity = new TagEntity()
        tagEntity.entityId = entity.id

        tag.entities.add(tagEntity)
        await em.persistAndFlush(tag)
        return this.tagEntityToGroup(tag)
    }

    async addEntities(tagId: string, entities: ITagEntity[]): Promise<Group> {
        let em = this.em.fork()
        const tag = await em.findOne(Tag, { id: tagId })
        for(let entity of entities) {
            const tagEntityExists = await em.find(TagEntity, { entityId: entity.id, tag })
            if(tagEntityExists.length > 0) {
                // tag entity already exists here
                continue
            }
            const tagEntity = new TagEntity()
            tagEntity.entityId = entity.id
    
            tag.entities.add(tagEntity)
        }
        await em.persistAndFlush(tag)
        return this.tagEntityToGroup(tag)
    }


    async setTemplateObject(templateObject: string, group: Group): Promise<Group> {
        const tag = await this.em.fork().findOne(Tag, { id: group.id })
        tag.templateId = templateObject
        await this.em.fork().persistAndFlush(tag)
        group.templateObject = templateObject
        return group
    }


    async initTestingFunc() {
        console.log('Init Fn')
        if(this.inited) return
        // TODO: this is just for testing
   
           // TODOs:
           // 1. All tag names must not containe space
           // 2. All tag names must be in small letters
           // 3. 
           await this.createTag({
               name: 'users',
               description: 'Users Namespace'
           })
   
           await this.createTag({
               name: 'users:admins',
               description: 'Admin Users Namespace'
           })
           await this.createTag({
               name: 'users:admins:support',
               description: 'Support Admin Users Namespace'
           })
           await this.createTag({
               name: 'users:admins:tech',
               description: 'Tech Admin Users Namespace'
           })
   
           await this.createTag({
               name: 'users:organisations',
               description: 'Organisation Users Namespace'
           })
   
           await this.createTag({
               name: 'users:organisations:fintechs',
               description: 'Fintech Organisation Users Namespace'
           })
           await this.createTag({
               name: 'users:organisations:schools',
               description: 'School Organisation Users Namespace'
           })
   
           
           let userTag = await this.query('users')
           let adminUsersTag = await this.query('users:admins')

            userTag = await this.addEntities(userTag.id, [{ id: 'user1'}, { id: 'user2'}, { id: 'user3'}, { id: 'user4'}, { id: 'user5'}])
            adminUsersTag = await this.addEntities(adminUsersTag.id, [{ id: 'user2'}, { id: 'user4'}])

            this.inited = true
   }

   async playground() {
       // Using the resolver function of a tag
       async function sampleResolverFn(e: ITagEntity): Promise<MyUser> {
            for(let u of users) {
                if(u.id === e.id) return u
            }
            return undefined
        }

        async function sampleIntent(opt: TagIntentOptions<MyUser>): Promise<MyUser> {
            let user = opt.entity
            if(user.templates) {
                // assuming  i have a way of resolving templateObjects
                // i would do that here
                user.templates.push(opt.templateObject)
            } else {
                user.templates = [opt.templateObject]
            }
            return user
        }

        let usersTag = await this.query('users')
        let adminUsersTag = await this.query('users:admins')
        let adminTechusersTag = await this.query('users:admins:tech')

        await this.setTemplateObject('template1', usersTag)
        await this.setTemplateObject('template2', adminUsersTag)
        await this.setTemplateObject('template2a', adminUsersTag)
        await this.setTemplateObject('template3', adminTechusersTag)

        console.log(
            "before Intent:",
            await this.resolveEntites(sampleResolverFn, adminUsersTag.id)
        )

        const intentResult = await this.executeIntent({
            resolveFn: sampleResolverFn,
            intent: sampleIntent
        }, adminUsersTag.id)

        const intentResult2 = await this.executeIntent({
            resolveFn: sampleResolverFn,
            intent: sampleIntent
        }, adminTechusersTag.id)


        console.log( "after Intent:",intentResult, intentResult2)
   }

    async resolveEntites<T>(resolve: IResolverFunction<T>, tagId: string): Promise<T[]> {
        let entities:T[] = []
        const tag = await this.em.fork().findOne(Tag, { id: tagId }, {populate: ['entities']})
        for(let e of tag.entities) {
            entities.push(await resolve({
                id: e.entityId
            }))
        }
        return entities
    }

    // async initEntities() {
    //     if(mockTagEntitiesDb[this.id]) {
    //         this.entities = mockTagEntitiesDb[this.id]
    //     }
    // }



   async addChid(parentId: string, childId: string): Promise<void> {
       let em = this.em.fork()

       // check if relationship already exists
       const relation: TagRelation = await em.findOne(TagRelation, { parentId, childId })
       const relation2: TagRelation = await em.findOne(TagRelation, { parentId: childId, childId: parentId })
       if(relation || relation2) return

        const newRelation = new TagRelation()
        newRelation.childId = childId
        newRelation.parentId = parentId

        await em.persistAndFlush(newRelation)
        
        // step 1: add dynamic Tag name to db
        const child = await em.findOne(Tag, { id: childId })
        this.accumulateNames(child.name.toString(), parentId, childId)
   }

   async accumulateNames(prevNames: string, parentId: string, childId: string): Promise<void> {
        let em = this.em.fork()
        const parent = await em.findOne(Tag, { id: parentId })
        const child = await em.findOne(Tag, { id: childId })

        if(!parent || !child) {
            return
        }

        if(!parent.name || parent.name === '') return
        if(!prevNames || prevNames === '') return

        const n: string = parent.name + ":" + prevNames

        // add dynamic Tag name to db
        const tagRoute = await em.findOne(TagRoute, { routeName: n })
        if(!tagRoute) {
            const newRoute =  new TagRoute()
            newRoute.routeName = n
            newRoute.tag = child
            em.persistAndFlush(newRoute)
        } else {
            console.log('Tag Name:', n, "already exists in the system")
        }


        // do same for parents of parent
        const relations = await em.find(TagRelation, { childId: parent.id })
        for(let r of relations) {
            await this.accumulateNames(n, r.childId, r.parentId)
        }
    }


    async executeIntent<T>(tagIntent: TagIntent<T>, tagId: string): Promise<T[]> {
        if(!tagId) {
            console.log('Execute Intent Error: tagId', tagId)
        }
        // step 1: resolve the entities using the resolve function
        // step 2: pass these entities up the tree for further actions
        return await this.traverseTree(tagIntent, await this.resolveEntites(tagIntent.resolveFn, tagId), tagId)
    }

    async traverseTree<T>(tagIntent: TagIntent<T>, entities: T[], tagId: string): Promise<T[]> {
        let em = this.em.fork()

        const tag = await em.findOne(Tag, { id: tagId })
        let outputEntities = entities
        const tagRelations = await em.find(TagRelation, { childId: tag.id })
        if(tagRelations) {
            for(let r of tagRelations) {
                outputEntities = await this.traverseTree(tagIntent, outputEntities, r.parentId)
            }
        }
        
        // Execute intent
        // Step 2: for each entity, execute intent
        let outputs:T[] = []
        for(let e of outputEntities) {
            let output = await tagIntent.intent({
                tagName: tag.name.toString(),
                templateObject: tag.templateId.toString(),
                entity: e
            })
            outputs.push(output)
        }
        return outputEntities
    }

}