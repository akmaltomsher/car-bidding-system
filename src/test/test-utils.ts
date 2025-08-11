import { TestingModule, Test } from '@nestjs/testing';

/**
 * @param controller - The controller to test.
 * @param serviceMock - A mock object for the service.
 */
export async function createTestingModule(controller: any, serviceMock: any): Promise<TestingModule> {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [controller],
    providers: [
      {
        provide: serviceMock.provide,
        useValue: serviceMock.useValue,
      },
    ],
  }).compile();

  return module;
}
