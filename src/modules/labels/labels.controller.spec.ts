import { Test, TestingModule } from '@nestjs/testing';
import { LabelsController } from './labels.controller.js';
import { LabelsService } from './labels.service.js';
import { LabelsRepository } from './labels.repository.js';
import { APP_ENV } from '../../config/tokens.js';
import { SessionService } from '../identity/session.service.js';

describe('LabelsController', () => {
  let controller: LabelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabelsController],
         providers: [LabelsService,
               {
           provide: LabelsRepository,
           useValue: {},
         },      {
           provide: APP_ENV,
           useValue: {},
         },      {
           provide: SessionService,
           useValue: {},
         }]
    }).compile();

    controller = module.get<LabelsController>(LabelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
