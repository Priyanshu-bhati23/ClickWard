"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/utils/prisma";

export async function createExperiment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const goal = formData.get("goal") as string;
  const targetSelector = formData.get("targetSelector") as string;

  if (!name || !goal) {
    redirect("/dashboard/experiments/new?error=Name and goal are required");
  }

  const experiment = await prisma.experiment.create({
    data: {
      userId: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      goal,
      targetSelector: targetSelector?.trim() || "#hero-cta",
      status: "Draft",
      variants: {
        create: [
          {
            name: "Control",
            headline: "Get Started Today",
            description: "Start using our platform today.",
            ctaText: "Get Started",
          },
          {
            name: "Variant B",
            headline: "Build Better Products",
            description: "Test your ideas and learn what users prefer.",
            ctaText: "Try ClickWard",
          },
        ],
      },
    },
  });

  redirect(`/dashboard/experiments/${experiment.id}`);
}
