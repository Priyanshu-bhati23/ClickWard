"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/utils/prisma";
import { revalidatePath } from "next/cache";

export async function updateTargetSelector(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const experimentId = formData.get("experimentId") as string;
  const targetSelector = (formData.get("targetSelector") as string).trim();

  const experiment = await prisma.experiment.findFirst({
    where: { id: experimentId, userId: user.id },
  });
  if (!experiment) redirect("/dashboard");

  await prisma.experiment.update({
    where: { id: experimentId },
    data: { targetSelector },
  });

  revalidatePath(`/dashboard/experiments/${experimentId}`);
}

export async function updateVariant(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const variantId = formData.get("variantId") as string;
  const experimentId = formData.get("experimentId") as string;

  const experiment = await prisma.experiment.findFirst({
    where: { id: experimentId, userId: user.id },
  });
  if (!experiment) redirect("/dashboard");

  const allocationStr = formData.get("allocation") as string;
  const allocation = allocationStr !== null && allocationStr !== undefined ? parseInt(allocationStr, 10) : undefined;

  const targetHref = (formData.get("targetHref") as string || "").trim();
  const targetVisibleStr = formData.get("targetVisible") as string;
  const targetVisible = targetVisibleStr === "false" ? false : true;

  await prisma.variant.update({
    where: { id: variantId },
    data: {
      name: (formData.get("name") as string).trim(),
      headline: (formData.get("headline") as string).trim(),
      description: (formData.get("description") as string).trim(),
      ctaText: (formData.get("ctaText") as string).trim(),
      targetHref: targetHref || null,
      targetVisible,
      ...(allocation !== undefined && !isNaN(allocation) ? { allocation } : {}),
    },
  });

  revalidatePath(`/dashboard/experiments/${experimentId}`);
}

export async function createVariantAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const experimentId = formData.get("experimentId") as string;
  const name = (formData.get("name") as string).trim();
  const headline = (formData.get("headline") as string).trim();
  const description = (formData.get("description") as string).trim();
  const ctaText = (formData.get("ctaText") as string).trim();
  const targetHref = (formData.get("targetHref") as string || "").trim();

  const experiment = await prisma.experiment.findFirst({
    where: { id: experimentId, userId: user.id },
  });
  if (!experiment) redirect("/dashboard");

  await prisma.variant.create({
    data: {
      experimentId,
      name: name || "New Variant",
      headline: headline || "Control Headline",
      description: description || "Variant description",
      ctaText: ctaText || "Click Here",
      targetHref: targetHref || null,
      targetVisible: true,
      allocation: 50,
    },
  });

  revalidatePath(`/dashboard/experiments/${experimentId}`);
}

export async function promoteVariantAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const experimentId = formData.get("experimentId") as string;
  const variantId = formData.get("variantId") as string;

  const experiment = await prisma.experiment.findFirst({
    where: { id: experimentId, userId: user.id },
    include: { variants: true },
  });
  if (!experiment) redirect("/dashboard");

  // Update allocations: target variant -> 100%, others -> 0%
  for (const v of experiment.variants) {
    await prisma.variant.update({
      where: { id: v.id },
      data: { allocation: v.id === variantId ? 100 : 0 },
    });
  }

  // Set winningVariantId & mark status as Completed
  await prisma.experiment.update({
    where: { id: experimentId },
    data: {
      winningVariantId: variantId,
      status: "Completed",
    },
  });

  revalidatePath(`/dashboard/experiments/${experimentId}`);
}

export async function clearSimulationAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const experimentId = formData.get("experimentId") as string;

  const experiment = await prisma.experiment.findFirst({
    where: { id: experimentId, userId: user.id },
  });
  if (!experiment) redirect("/dashboard");

  await prisma.event.deleteMany({
    where: {
      experimentId,
      isSimulated: true,
    },
  });

  revalidatePath(`/dashboard/experiments/${experimentId}`);
}

export async function activateExperiment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const experimentId = formData.get("experimentId") as string;

  const experiment = await prisma.experiment.findFirst({
    where: { id: experimentId, userId: user.id },
  });
  if (!experiment) redirect("/dashboard");

  await prisma.experiment.update({
    where: { id: experimentId },
    data: { status: "Running" },
  });

  revalidatePath(`/dashboard/experiments/${experimentId}`);
}

export async function completeExperiment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const experimentId = formData.get("experimentId") as string;

  const experiment = await prisma.experiment.findFirst({
    where: { id: experimentId, userId: user.id },
  });
  if (!experiment) redirect("/dashboard");

  await prisma.experiment.update({
    where: { id: experimentId },
    data: { status: "Completed" },
  });

  revalidatePath(`/dashboard/experiments/${experimentId}`);
}
