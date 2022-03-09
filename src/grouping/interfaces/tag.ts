export type TagOptions = {
    description?: string,
    id: string,
    name: string,
    templateObject: string
}

export interface IResolverFunction<T> {
    (entity: ITagEntity): Promise<T>
}

export interface ITagEntity {
    id: string | String
}


// TAG INTENT INTERFACES
export type TagIntent<T> = {
    resolveFn: IResolverFunction<T> // a function that resolves the entity into T
    intent: IIntent<T>

}

export type TagIntentOptions<T> = {
    tagName:string,
    templateObject:string, 
    entity: T
}

export interface IIntent<T> {
    (tagIntentOptions: TagIntentOptions<T>): Promise<T>
}


// this db stores all tags that have been created so far.
// the key is tagName
export const mockTagsDb: Map<string, TagOptions> = new Map<string, TagOptions>()

// this db maps a parent tag to it's children
// key = tagId, value = list of childTagOptions
export const mockTagChildrenDb: Map<string, TagOptions[]> = new Map<string, TagOptions[]>()
export const mockTagParentsDb: Map<string, TagOptions[]> = new Map<string, TagOptions[]>()

// this db contains all possible names in the tag system
// this is helpful in quering tags
export const mockTagNamesDb: Map<string, TagOptions> = new Map<string, TagOptions>()

// this db constains all entities belonging to a tag
// key =  tagId, value = list of entities
export const mockTagEntitiesDb: Map<string, ITagEntity[]> = new Map<string, TagOptions[]>()

// this db contains all tag template object IDs
// key = tagId, value = templateID
export const mockTagTemplateDb: Map<string, string> = new Map<string, string>()


export class Tag {
    name: string
    id: string
    description: string
    templateObject?: string
    parents: Tag[]
    entities: ITagEntity[]
    children: Tag[]

    constructor(options: TagOptions) {
        this.name = options.name
        this.id = options.id
        this.description = options.description
        this.templateObject = options.templateObject

        // init lists
        this.children = []
        this.parents = []
        this.entities = []
    }

    getOptions(): TagOptions {
        return {
            name: this.name,
            description: this.description,
            id: this.id,
            templateObject: this.templateObject
        }
    }

    linkTo(tag: Tag): void {
        tag.addChild(this)
    }

    addChild(tag: Tag): void {
        // TODO: implement add child
        let opt = {
            name: tag.name,
            description: tag.description,
            id: tag.id
        } as TagOptions

        if(mockTagChildrenDb[this.id]) {
            mockTagChildrenDb[this.id].push(opt)
        } else {
            mockTagChildrenDb[this.id] = [opt]
        }

        if(mockTagParentsDb[tag.id]) {
            mockTagParentsDb[tag.id].push(this.getOptions())
        } else {
            mockTagParentsDb[tag.id] = [this.getOptions()]
        }
        
        // step 1: add dynamic Tag name to db
        this.accumulateNames(tag.name, tag.getOptions())
    }

    addEntity(entity: ITagEntity): void {
        this.entities.push(entity)
        if(mockTagEntitiesDb[this.id]) {
            mockTagEntitiesDb[this.id].push(entity)
        } else {
            mockTagEntitiesDb[this.id] = [entity]
        }
    }

    setTemplateObject(templateObject: string): void {
        this.templateObject = templateObject
        mockTagTemplateDb[this.id] = templateObject
        // console.log('Changing v:', mockTagsDb)
        mockTagsDb[this.id] = this.getOptions()

        if(mockTagChildrenDb[this.id]) {
            for(let i = 0; i < mockTagChildrenDb[this.id].length; i++) {
                console.log("cccc", mockTagChildrenDb[this.id][i], this.id)
                if(mockTagChildrenDb[this.id][i].id === this.id) {
                    console.log('foundChild:')
                    mockTagChildrenDb[this.id][i] = this.getOptions()
                    break
                }
            }
        }
        

        if(mockTagParentsDb[this.id]) {
            for(let i = 0; i < mockTagParentsDb[this.id].length; i++) {
                console.log("ddd", mockTagParentsDb[this.id][i], this.id)
                if(mockTagParentsDb[this.id][i].id === this.id) {
                    console.log('foundParent')
                    mockTagParentsDb[this.id][i] = this.getOptions()
                    break
                }
            }
        }
        
        
        // mockTagChildrenDb[this.id] = this.getOptions()
        // mockTagParentsDb[this.id] = this.getOptions()
    }

    async resolveEntites<T>(resolve: IResolverFunction<T>): Promise<T[]> {
        let entities:T[] = []
        for(let e of this.entities) {
            entities.push(await resolve(e))
        }
        return entities
    }

    async initEntities() {
        if(mockTagEntitiesDb[this.id]) {
            this.entities = mockTagEntitiesDb[this.id]
        }
    }

    accumulateNames(prevNames: string, options: TagOptions): void {
        if(!this.name || this.name === '') return
        if(!prevNames || prevNames === '') return

        const n: string = this.name + ":" + prevNames

        // add dynamic Tag name to db
        if(!mockTagNamesDb[n]) {
            mockTagNamesDb[n] = options
        } else {
            console.log('Tag Name:', n, "already exists in the system")
        }

        // do same for parents
        for(let parent of this.parents) {
            parent.accumulateNames(n, options)
        }
    }

    getChildren(): Tag[] {
        let tags: Tag[] = []
        if(mockTagChildrenDb[this.id]) {
            for(let childIdOpt of mockTagChildrenDb[this.id]) {
                let t = new Tag(childIdOpt)
                t.children = t.getChildren()
                tags.push(t)
            }
            this.children = tags
            return this.children
        }
        else return this.children
    }

    getParents(): Tag[] {
        let tags: Tag[] = []
        if(mockTagParentsDb[this.id]) {
            for(let parentIdOpt of mockTagParentsDb[this.id]) {
                let t = new Tag(parentIdOpt)
                t.parents = t.getParents()
                tags.push(t)
            }
            this.parents = tags
            return this.parents
        }
        else return this.parents
    }

    async executeIntent<T>(tagIntent: TagIntent<T>): Promise<T[]> {
        // step 1: resolve the entities using the resolve function
        // step 2: pass these entities up the tree for further actions
        return await this.traverseTree(tagIntent, await this.resolveEntites(tagIntent.resolveFn))
    }

    async traverseTree<T>(tagIntent: TagIntent<T>, entities: T[]): Promise<T[]> {
        console.log('me:', this.name, this.templateObject)
        let outputEntities = entities
        if(mockTagParentsDb[this.id]) {
            // Step 1: execute parent first
            // let outputEntities = entities
            for(let parentIdOpt of mockTagParentsDb[this.id]) {
                let t = new Tag(parentIdOpt)
                // t.parents = t.getParents()
                outputEntities = await t.traverseTree(tagIntent, outputEntities)
            }

            // // Execute intent
            // // Step 2: for each entity, execute intent
            // let outputs:T[] = []
            // for(let e of outputEntities) {
            //     let output = await tagIntent.intent({
            //         tagName: this.name,
            //         templateObject: this.templateObject,
            //         entity: e
            //     })
            //     outputs.push(output)
            // }
            // Step 2: return the output so other can use it
            // return outputs
            
        }
        
        // Execute intent
        // Step 2: for each entity, execute intent
        let outputs:T[] = []
        for(let e of outputEntities) {
            let output = await tagIntent.intent({
                tagName: this.name,
                templateObject: this.templateObject,
                entity: e
            })
            outputs.push(output)
        }
        return outputEntities
        // return entities
    }
}