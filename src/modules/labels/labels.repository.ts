import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";

@Injectable()
export class LabelsRepository{
    constructor( private readonly prisma:PrismaService){}
    async listLabels(){
        return this.prisma.label.findMany({
               orderBy: {
        name: "asc",
      },
        })
    }
    async listAssignmentsLabels(assignmentIds:string[]){
return this.prisma.assignmentLabel.findMany({
    where:{
        assignmentId:{
            in:assignmentIds
        }
    },
    include:{
        label:true
    }
})
    }

}