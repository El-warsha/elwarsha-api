import { Test, TestingModule } from '@nestjs/testing';
import { LabelsService } from './labels.service.js';
import { LabelsRepository } from './labels.repository.js';

describe('LabelsService', () => {
  let service: LabelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LabelsService,
          {
      provide: LabelsRepository,
      useValue: {},
    },]
    }).compile();

    service = module.get<LabelsService>(LabelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
