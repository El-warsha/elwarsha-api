import { Test, TestingModule } from "@nestjs/testing";
import { ApplicationsController } from "./applications.controller.js";
import { ApplicationsService } from "./applications.service.js";
import { ThrottlerModule } from "@nestjs/throttler";

describe("ApplicationsController", () => {
  let controller: ApplicationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({
          throttlers: [{ ttl: 60000, limit: 5 }],
        }),
      ],
      controllers: [ApplicationsController],
      providers: [ApplicationsService],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
