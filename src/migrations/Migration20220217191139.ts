import { Migration } from '@mikro-orm/migrations';

export class Migration20220217191139 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "payroll" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "deleted_at" timestamptz null, "report_id" varchar(255) not null, "organisation_wallet_id" varchar(255) not null, "payroll_month" varchar(255) not null, "payroll_year" varchar(255) not null, "total_number_of_employees" numeric(10,0) not null, "total_gross_salary" numeric(10,0) not null, "total_net_salary" numeric(10,0) not null, "executed" boolean null default false);');

    this.addSql('create table "payslip" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "deleted_at" timestamptz null, "payroll_id" varchar(255) not null, "payroll_beneficiary_id" varchar(255) not null, "net_pay" numeric(10, 2) not null, "gross_pay" numeric(10,2) not null);');

    this.addSql('create table "pay_breakdown" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "deleted_at" timestamptz null, "payslip_id" varchar(255) not null, "description" varchar(255) not null, "amount" numeric(10, 2) not null);');

    this.addSql('create table "payroll_beneficiary" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "deleted_at" timestamptz null, "employee_wallet_id" varchar(255) not null, "bank_name" varchar(255) not null, "account_name" varchar(255) not null, "account_num" varchar(255) not null, "monthly_salary" numeric(10,2) not null, "opt_in_pension" boolean null default false, "opt_in_nhf" boolean null default false, "opt_in_nhis" boolean null default false);');
    this.addSql('alter table "payroll_beneficiary" add constraint "wallet_id_unique" unique ("employee_wallet_id");');


    this.addSql('create table "payroll_report" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "deleted_at" timestamptz null, "description" varchar(255), "reported" boolean null default false);');




    // for tag system
    this.addSql('create table "tag" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "deleted_at" timestamptz null, "name" varchar(255) not null, "description" varchar(255), "template_id" varchar(255));');
    this.addSql('alter table "tag" add constraint "tag_name_unique" unique ("name");');

    this.addSql('create table "tag_relation" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "deleted_at" timestamptz null, "parent_id" varchar(255) not null, "child_id" varchar(255) not null);');
    this.addSql('create table "tag_route" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "deleted_at" timestamptz null, "tag_id" varchar(255) not null, "route_name" varchar(255) not null);');
    this.addSql('create table "tag_entity" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz null, "deleted_at" timestamptz null, "tag_id" varchar(255) not null, "entity_id" varchar(255) not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "payroll" cascade;');
    this.addSql('drop table if exists "payslip" cascade;');
    this.addSql('drop table if exists "pay_breakdown" cascade;');
    this.addSql('drop table if exists "payroll_beneficiary" cascade;');
    this.addSql('drop table if exists "payroll_report" cascade;');

    // for tag system
    this.addSql('drop table if exists "tag" cascade;');
    this.addSql('drop table if exists "tag_relation" cascade;');
    this.addSql('drop table if exists "tag_route" cascade;');
    this.addSql('drop table if exists "tag_entity" cascade;');

  }

}
