import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncomeTaxModule,  } from './income-tax/income-tax.module';

// Mikro-Orm
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [IncomeTaxModule, ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..','public'),
    exclude: ['/tax*']
  }), MikroOrmModule.forRoot({
    entities: ['./dist/entities'],
    entitiesTs: ['./src/entities'],
    dbName: 'myDb',
    type:'mysql'
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
