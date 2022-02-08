import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IncomeTaxModule,  } from './income-tax/income-tax.module';

@Module({
  imports: [IncomeTaxModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
