import prisma from './prismaClient';
import { ResourceType, EnvironmentVariable } from '@prisma/client';
import envVarsService from './envVars';

// gets all services - only top level data - assumes one pipeline
async function getAll() {
  try {
    const allServices = await prisma.service.findMany();

    // Retrieve env vars for all services
    const envVars = await envVarsService.getAll(ResourceType.SERVICE);
    // Group env vars by service id
    const groupedEnvVars = envVars?.reduce(
      (entryMap, e) =>
        entryMap.set(e.resourceId, [...(entryMap.get(e.resourceId) || []), e]),
      new Map(),
    );
    // Insert into the associated pipeline object inside allServices
    allServices.forEach((service) => {
      const envVarsForService: EnvironmentVariable[] = groupedEnvVars?.get(
        service.id,
      );
      const flattenedEnvVars: { [key: string]: string } = {};
      envVarsForService?.forEach((envVar) => {
        flattenedEnvVars[envVar.name] = envVar.value;
      });
      Object.assign(service, flattenedEnvVars);
    });

    await prisma.$disconnect();
    return allServices;
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
  }
}

async function getOne(serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId
      }
    });
    await prisma.$disconnect();
    return service;
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
  }
}

async function createOne(serviceData: any) {
  // split serviceData argument into what is needed for each create method
  const { awsEcrRepo, awsEcsService, ...serviceTableData } = serviceData;

  try {
    const service = await prisma.service.create({
      data: serviceTableData // change this to serviceTableData
    });

    // handling of env

    const envVarsCount = await prisma.environmentVariable.createMany({
      data: [
        {
          name: 'awsEcrRepo',
          value: awsEcrRepo,
          resourceId: service.id,
          resourceType: ResourceType.SERVICE,
        },
        {
          name: 'awsEcsService',
          value: awsEcsService,
          resourceId: service.id,
          resourceType: ResourceType.SERVICE,
        }
      ]
    });

    await prisma.$disconnect();
    return [service, envVarsCount];
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
  }
}

export default { getAll, getOne, createOne };
