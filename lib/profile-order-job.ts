import { prisma } from "@/lib/db";

export type ProfileOrderJobAction = "test" | "sync";

export async function createProfileOrderJob(action: ProfileOrderJobAction) {
  const id = crypto.randomUUID();
  await prisma.appSetting.update({
    where: { id: "default" },
    data: {
      profileOrderJobId: id,
      profileOrderJobAction: action,
      profileOrderJobStatus: "pending",
      profileOrderJobMessage: "",
    },
  });
  return { id, action, status: "pending", message: "" };
}

export async function readProfileOrderJob() {
  const settings = await prisma.appSetting.findUnique({ where: { id: "default" } });
  return {
    id: settings?.profileOrderJobId ?? "",
    action: settings?.profileOrderJobAction ?? "",
    status: settings?.profileOrderJobStatus ?? "idle",
    message: settings?.profileOrderJobMessage ?? "",
  };
}

export async function finishProfileOrderJob(message: string, status: "done" | "error") {
  const settings = await prisma.appSetting.findUnique({ where: { id: "default" } });
  if (settings?.profileOrderJobStatus !== "pending") return;
  await prisma.appSetting.update({
    where: { id: "default" },
    data: {
      profileOrderJobStatus: status,
      profileOrderJobMessage: message,
    },
  });
}
