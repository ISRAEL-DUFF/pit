import { Module } from '@nestjs/common';
import { IncomeTaxService } from './income-tax.service';
import { IncomeTaxController } from './income-tax.controller';

@Module({
    providers: [IncomeTaxService],
    controllers: [IncomeTaxController]
})
export class IncomeTaxModule {}
