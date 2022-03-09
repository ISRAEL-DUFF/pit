import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncomeTaxModule,  } from './income-tax/income-tax.module';
import mikroOrmConfig  from './mikro-orm-config';

// Mikro-Orm
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { GroupingModule } from './grouping/grouping.module';

@Module({
  imports: [IncomeTaxModule, GroupingModule, ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..','public'),
    exclude: ['/tax*', '/group*']
  }), MikroOrmModule.forRoot(mikroOrmConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
