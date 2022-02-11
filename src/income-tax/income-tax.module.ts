import { Module } from '@nestjs/common';
import { IncomeTaxService } from './income-tax.service';
import { IncomeTaxController } from './income-tax.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PayBreakdown } from 'src/entities/PayBreakdown';

@Module({
    imports: [
        MikroOrmModule.forFeature([PayBreakdown]) 
    ],
    providers: [IncomeTaxService],
    controllers: [IncomeTaxController]
})
export class IncomeTaxModule {}
