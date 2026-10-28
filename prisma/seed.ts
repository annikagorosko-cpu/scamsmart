import { Prisma, PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

type SeedOption = { id: string; text: string };
type SeedQuestion = {
  id: string;
  prompt: string;
  options: SeedOption[];
  correctOptionId: string;
  explanation: string;
};
type SeedModule = {
  id: string;
  order: number;
  title: string;
  icon: string;
  intro: string;
  scenario: Prisma.InputJsonValue;
  warningSigns: string[];
  safeActions: string[];
  takeaway: string;
  questions: SeedQuestion[];
};

async function main() {
  const file = path.join(process.cwd(), "content", "scamsmart-content.json");
  const data = JSON.parse(readFileSync(file, "utf-8")) as { modules: SeedModule[] };

  for (const m of data.modules) {
    const moduleFields = {
      order: m.order,
      title: m.title,
      icon: m.icon,
      intro: m.intro,
      scenario: m.scenario,
      warningSigns: m.warningSigns,
      safeActions: m.safeActions,
      takeaway: m.takeaway,
    };
    await prisma.module.upsert({
      where: { id: m.id },
      update: moduleFields,
      create: { id: m.id, ...moduleFields },
    });

    let order = 0;
    for (const q of m.questions) {
      order += 1;
      const questionFields = {
        moduleId: m.id,
        order,
        prompt: q.prompt,
        explanation: q.explanation,
        correctOptionKey: q.correctOptionId,
      };
      await prisma.question.upsert({
        where: { id: q.id },
        update: questionFields,
        create: { id: q.id, ...questionFields },
      });

      for (const o of q.options) {
        await prisma.option.upsert({
          where: { questionId_key: { questionId: q.id, key: o.id } },
          update: { text: o.text },
          create: { questionId: q.id, key: o.id, text: o.text },
        });
      }
    }
  }

  const modules = await prisma.module.count();
  const questions = await prisma.question.count();
  console.log(`Seed finished: ${modules} modules, ${questions} questions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
