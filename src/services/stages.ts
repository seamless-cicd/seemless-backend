import { StageType, Status } from '@prisma/client';
import prisma from '../utils/prisma-client';

// Get all Stages for a Run
// They will be ordered on the Frontend
async function getAllForRun(runId: string) {
  try {
    const stages = await prisma.stage.findMany({
      where: {
        runId: runId,
      },
    });
    await prisma.$disconnect();
    return stages;
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
  }
}

async function deleteOne(id: string) {
  try {
    const deletedStage = await prisma.stage.delete({
      where: {
        id: id,
      },
    });
    await prisma.$disconnect();
    return deletedStage;
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
  }
}

async function createAll(runId: string) {
  try {
    await Promise.all(
      Object.values(StageType).map((type) => {
        return prisma.stage.create({
          data: {
            startedAt: new Date(),
            type,
            runId,
          },
        });
      }),
    );
    await prisma.$disconnect();
  } catch (e) {
    console.log(e);
    await prisma.$disconnect();
  }
}

// For testing polling
async function updateOne(id: string, data: any) {
  try {
    const updated = await prisma.stage.update({
      where: {
        id: id,
      },
      data: data,
    });
    await prisma.$disconnect();
    return updated;
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
  }
}

// Update status and duration of a Stage, using status updates sent by the state machine
async function updateStageStatus(id: string, status: Status) {
  try {
    const stage = await prisma.stage.findUnique({
      where: {
        id: id,
      },
    });

    if (!stage) {
      throw new Error('stage does not exist');
    }

    let updatedStage;

    // If Stage hasn't started, record the current time
    if (!stage.startedAt) {
      updatedStage = await prisma.stage.update({
        where: {
          id: id,
        },
        data: {
          status,
          startedAt: new Date(),
        },
      });
    } else {
      const endedAt = new Date();
      const stageEnded = status === Status.FAILURE || Status.SUCCESS;

      const duration = Math.floor(
        (endedAt.getTime() - stage.startedAt.getTime()) / 1000,
      );

      updatedStage = await prisma.stage.update({
        where: {
          id: id,
        },
        data: {
          status,
          endedAt: stageEnded ? endedAt : null,
          duration: stageEnded ? duration : null,
        },
      });
    }

    await prisma.$disconnect();
    return updatedStage;
  } catch (e) {
    console.error(e);
    await prisma.$disconnect();
  }
}

export default {
  getAllForRun,
  createAll,
  deleteOne,
  updateOne,
  updateStageStatus,
};
