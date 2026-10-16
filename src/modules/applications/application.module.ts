import {ApplicationsService} from './applications.service.js'
import ApplicationsController from './applications.controller.js'
import { Module } from "@nestjs/common";

@Module({
    providers:[ApplicationsService],
    controllers:[ApplicationsController]
})
export class ApplicationsModule {}