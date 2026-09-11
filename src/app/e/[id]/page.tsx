import { notFound } from "next/navigation";
import prisma from "@/utils/prisma";
import PublicExperimentClient from "./client";

export default async function PublicExperimentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!experiment || experiment.status !== "Active") {
    notFound();
  }

  // Random 50/50 variant assignment
  const variantIndex = Math.floor(Math.random() * experiment.variants.length);
  const selectedVariant = experiment.variants[variantIndex];

  // Record visit
  await prisma.variant.update({
    where: { id: selectedVariant.id },
    data: { visits: { increment: 1 } },
  });

  return (
    <PublicExperimentClient
      variant={selectedVariant}
      experimentId={experiment.id}
    />
  );
}
