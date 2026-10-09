import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service.js";



@Injectable()
export class LabelsRepository{
    constructor(private readonly prisma:PrismaService){}

    async listLabels(){
        const records = await this.prisma.label.findMany({
            orderBy:{
                name : "asc",
            }
        });

        return records.map((record)=>({
            id : record.id ,
            name : record.name,

        }));
    }

}