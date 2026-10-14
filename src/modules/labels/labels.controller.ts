import { Controller, Get, UseGuards } from "@nestjs/common";
import { LabelsService } from "./labels.service.js";
import { AuthGuard, RequireCapability } from "../identity/auth.guard.js";
import { ApiTags } from "@nestjs/swagger";


@ApiTags("labels")
@Controller("api/v1")
@UseGuards(AuthGuard)
export class LabelsController{
    constructor(private readonly labels:LabelsService){}

    @Get("labels")
    @RequireCapability("assignments.read")
    listLabels(){
        return this.labels.listLabels();
    }

}