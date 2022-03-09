import { Test, TestingModule } from '@nestjs/testing';
import { GroupingService } from './grouping.service';
import { EntityManager, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { v4 as uuid } from "uuid";
// import { AbstractNamingStrategy, NamingStrategy } from "@mikro-orm/core";
import { Tag as Group, ITagEntity, TagOptions, TagIntent, TagIntentOptions, mockTagNamesDb, mockTagsDb, IResolverFunction } from "./interfaces/tag";

import { MikroOrmModule } from "@mikro-orm/nestjs";
import mikroOrmConfig from '../mikro-orm-config';


// async function initTestingFunc(tagService: GroupingService) {
       
//        await tagService.createTag({
//            name: 'users',
//            description: 'Users Namespace'
//        })

//        await this.createTag({
//            name: 'users:admins',
//            description: 'Admin Users Namespace'
//        })
//        await this.createTag({
//            name: 'users:admins:support',
//            description: 'Support Admin Users Namespace'
//        })
//        await this.createTag({
//            name: 'users:admins:tech',
//            description: 'Tech Admin Users Namespace'
//        })

//        await this.createTag({
//            name: 'users:organisations',
//            description: 'Organisation Users Namespace'
//        })

//        await this.createTag({
//            name: 'users:organisations:fintechs',
//            description: 'Fintech Organisation Users Namespace'
//        })
//        await this.createTag({
//            name: 'users:organisations:schools',
//            description: 'School Organisation Users Namespace'
//        })

       
//        let userTag = await this.query('users')
//        let adminUsersTag = await this.query('users:admins')

//         userTag = await this.addEntities(userTag.id, [{ id: 'user1'}, { id: 'user2'}, { id: 'user3'}, { id: 'user4'}, { id: 'user5'}])
//         adminUsersTag = await this.addEntities(adminUsersTag.id, [{ id: 'user2'}, { id: 'user4'}])
// }

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

describe('TaggingService', () => {
    let groupingService: GroupingService
    let entityManager: EntityManager;

    beforeAll(async () => {
        // const NamingStrategyClassRef =
        //   mikroormOptions.namingStrategy as ImplementationOf<NamingStrategy>;
        // const mockLogger = { setContext: jest.fn, error: jest.fn };
        const module: TestingModule = await Test.createTestingModule({
          imports: [MikroOrmModule.forRoot(mikroOrmConfig)],
          providers: [
            GroupingService,
            // {
            //   provide: LogService,
            //   useValue: mockLogger,
            // },

            // {
            //   provide: AbstractNamingStrategy,
            //   useClass: NamingStrategyClassRef,
            // },
          ],
        }).compile();

        groupingService = module.get<GroupingService>(GroupingService);
        entityManager = module.get<EntityManager>(EntityManager);


        //   beforeEach(async () => {
        //     const app: TestingModule = await Test.createTestingModule({
        //       providers: [GroupingService],
        //     }).compile();

    });

    it('should be defined', () => {
        expect(groupingService).toBeDefined()
    })

    describe('createTag', () => {

        it('should create a tag', async () => {
            const resp = await groupingService.createTag({name: 'users', description: 'Users tag'})
            expect(resp).toBeDefined()
            expect(resp.success).toBe(true)

            // test for duplicate tag name
            const resp2 = await groupingService.createTag({ name: 'users', description: 'Test for duplicate tag name'})
            expect(resp2).toBeDefined()
            expect(resp2.success).toBe(false)
        })

        it('should create nested sub-tags', async () => {
            const resp1 = await groupingService.createTag({
                name: 'users:admins',
                description: 'Admin Users Namespace'
            })
            const resp2 = await groupingService.createTag({
                name: 'users:admins:support',
                description: 'Support Admin Users Namespace'
            })
            const resp3 = await groupingService.createTag({
                name: 'users:admins:tech',
                description: 'Tech Admin Users Namespace'
            })


            const resp4 = await groupingService.createTag({
                name: 'users:organisations',
                description: 'Organisation Users Namespace'
            })

            const resp5 = await groupingService.createTag({
                name: 'users:organisations:fintechs',
                description: 'Fintech Organisation Users Namespace'
            })
            const resp6 = await groupingService.createTag({
                name: 'users:organisations:schools',
                description: 'School Organisation Users Namespace'
            })


            expect(resp1).toBeDefined()
            expect(resp1.success).toBe(true)

            expect(resp2).toBeDefined()
            expect(resp2.success).toBe(true)

            expect(resp3).toBeDefined()
            expect(resp3.success).toBe(true)

            expect(resp4).toBeDefined()
            expect(resp4.success).toBe(true)

            expect(resp5).toBeDefined()
            expect(resp5.success).toBe(true)

            expect(resp6).toBeDefined()
            expect(resp6.success).toBe(true)
        })
    })

    describe('queryTag', () => {
        it('should query a tag by name', async () => {
            const usersTag = await groupingService.query('users')
            const adminUsersTag = await groupingService.query('users:admins')
            const adminTechusersTag = await groupingService.query('users:admins:tech')

            expect(usersTag).toBeDefined()
            expect(usersTag.name).toBe('users')

            expect(adminUsersTag).toBeDefined()
            expect(adminUsersTag.name).toBe('users:admins')

            expect(adminTechusersTag).toBeDefined()
            expect(adminTechusersTag.name).toBe('users:admins:tech')
        })
    })

    describe('addEntities', () => {
        it('should add multi-entities to a group', async () => {
            let userTag = await groupingService.query('users')
            let adminUsersTag = await groupingService.query('users:admins')

            userTag = await groupingService.addEntities(userTag.id, [{ id: 'user1'}, { id: 'user2'}, { id: 'user3'}, { id: 'user4'}, { id: 'user5'}])
            adminUsersTag = await groupingService.addEntities(adminUsersTag.id, [{ id: 'user2'}, { id: 'user4'}])

            expect(userTag).toBeDefined()
            expect(userTag.entities.length).toBe(5)

            expect(adminUsersTag).toBeDefined()
            expect(adminUsersTag.entities.length).toBe(2)
        })
    })

    describe('executeIntent', () => {
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

        
        it('should execute an intent on a group', async () => {
            let usersTag = await groupingService.query('users')
            let adminUsersTag = await groupingService.query('users:admins')
            let adminTechusersTag = await groupingService.query('users:admins:tech')

            await groupingService.setTemplateObject('template1', usersTag)
            await groupingService.setTemplateObject('template2', adminUsersTag)
            await groupingService.setTemplateObject('template2a', adminUsersTag)
            await groupingService.setTemplateObject('template3', adminTechusersTag)


            const intentResult = await groupingService.executeIntent({
                resolveFn: sampleResolverFn,
                intent: sampleIntent
            }, adminUsersTag.id)

            const intentResult2 = await groupingService.executeIntent({
                resolveFn: sampleResolverFn,
                intent: sampleIntent
            }, adminTechusersTag.id)

            expect(intentResult).toBeDefined()
            // expect(intentResult.length).toBe()

            expect(intentResult2).toBeDefined()
        })
    })
});
