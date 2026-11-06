import { ApplicationsService } from './applications.service.js';
import { ConflictError } from '../../common/errors.js';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  beforeEach(() => {
    service = new ApplicationsService();
  });

it('a valid application returns a receipt with an app_id and status: "received"', async () => {
    const result = await service.apply(
      'cohort-1',
      'Malek Mostafa',
      'malek@example.com',
      'malek68'
    );

    expect(result).toHaveProperty('id'); 
    expect(result.status).toBe('received');
  });
  it('a duplicate email in different letter case rejects with ConflictError', async () => {
    await service.apply(
      'cohort-1',
      'Malek Mostafa',
      'Malek@example.com',
      'malek68'
    );

    await expect(
      service.apply(
        'cohort-1',
        'Another User',
        'malek@example.com',
        'anotherhandle'
      )
    ).rejects.toThrow(ConflictError);
  });

  it('reset() clears state', async () => {
    await service.apply(
      'cohort-1',
      'Malek Mostafa',
      'malek@example.com',
      'malek68'
    );

    service.reset();

    const resultAfterReset = await service.apply(
      'cohort-1',
      'Malek Mostafa',
      'malek@example.com',
      'malek68'
    );

    expect(resultAfterReset.status).toBe('received');
  });
});