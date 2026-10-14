import { Injectable } from "@nestjs/common";
import { CreateApplicationDto } from "./dto/apply-cohort.dto.js";
import { Applications } from "../../domain/models.js";

@Injectable()
export class ApplicationsService {
  private applications:Applications=[]
  create(slug:string,createApplicationDto: CreateApplicationDto) {
    return "This action adds a new application";
  }

}
