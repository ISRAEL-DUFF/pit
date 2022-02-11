import { Logger } from '@nestjs/common';
import { Options } from '@mikro-orm/core';
// import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
// import { Author, BaseEntity, Book, BookTag, Publisher } from './entities';
import { BaseEntity } from './entities/BaseEntity';
import { PayBreakdown } from './entities/PayBreakdown';

const logger = new Logger('MikroORM');
const config = {
  entities: [PayBreakdown, BaseEntity],
  dbName: 'mikro-orm-nest-ts',
  type: 'mysql',
  port: 3307,
//   highlighter: new SqlHighlighter(),
  debug: true,
  logger: logger.log.bind(logger),
} as Options;

export default config;