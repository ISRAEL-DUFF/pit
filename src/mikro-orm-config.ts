import { Logger } from '@nestjs/common';
import { Options, MigrationsOptions } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const logger = new Logger('MikroORM');

const dbType: String = 'postgres';

// const mikroOrmConfig: Options<MySqlDriver> = {
//   logger: logger.log.bind(logger),
//   entities: ['./dist/entities'],
//   entitiesTs: ['./src/entities'],
//   dbName: 'mkro_orm_db',
//   password: 'mysql',
//   // password: 'mr cheat',
//   type:'mysql',
//   // type:'postgresql',

//   migrations: {
//     snapshot: false,
//     tableName: "_mikro_orm_migrations",
//     path: "src/migrations",
//     disableForeignKeys: false,
//   } as MigrationsOptions
// }

// let mikroOrmConfig: Options<MySqlDriver> | Options<PostgreSqlDriver>;
let mikroOrmConfig: Options<PostgreSqlDriver>;

if(dbType == 'mysql') {
  // mikroOrmConfig = {
  //   logger: logger.log.bind(logger),
  //   entities: ['./dist/entities'],
  //   entitiesTs: ['./src/entities'],
  //   dbName: 'mkro_orm_db',
  //   password: 'mysql',
  //   // password: 'mr cheat',
  //   type:'mysql',
  
  //   migrations: {
  //     snapshot: false,
  //     tableName: "_mikro_orm_migrations",
  //     path: "src/migrations",
  //     disableForeignKeys: false,
  //   } as MigrationsOptions
  // } as Options<MySqlDriver>;
} else {
  mikroOrmConfig = {
    logger: logger.log.bind(logger),
    entities: ['./dist/entities'],
    entitiesTs: ['./src/entities'],
    dbName: 'mkro_orm_db',
    metadataProvider: TsMorphMetadataProvider,
    // password: 'mysql',
    // password: 'mr cheat',
    type:'postgresql',
  
    migrations: {
      snapshot: false,
      tableName: "_mikro_orm_migrations",
      path: "src/migrations",
      disableForeignKeys: false,
    } as MigrationsOptions
  } as Options<PostgreSqlDriver>;
}

export default mikroOrmConfig;