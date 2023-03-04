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
  try {
    const service = await prisma.service.create({
      data: serviceData
    });
    await prisma.$disconnect();
    return service;
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
  }
}

export default { getAll, getOne, createOne };
