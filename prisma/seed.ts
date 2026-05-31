import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays, startOfDay } from "date-fns";

const prisma = new PrismaClient();

function randomBetween(min: number, max: number, decimals = 1) {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function computeProductivityScore(
  studyHours: number,
  focusScore: number,
  moodScore: number,
  sleepHours: number,
  exerciseCompleted: boolean,
  distractionHours: number,
  dailyGoal: number
): number {
  const studyWeight = Math.min((studyHours / dailyGoal) * 30, 30);
  const focusWeight = (focusScore / 10) * 25;
  const moodWeight = (moodScore / 10) * 15;
  const sleepWeight = Math.min((sleepHours / 8) * 15, 15);
  const exerciseWeight = exerciseCompleted ? 10 : 0;
  const distractionPenalty =
    studyHours > 0 ? Math.min((distractionHours / studyHours) * 5, 5) : 5;
  const score =
    studyWeight +
    focusWeight +
    moodWeight +
    sleepWeight +
    exerciseWeight +
    (5 - distractionPenalty);
  return parseFloat(Math.min(score, 100).toFixed(1));
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing data
  await prisma.insight.deleteMany();
  await prisma.productivityStats.deleteMany();
  await prisma.dailyLog.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 12);
  const user = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "alex@flowstate.app",
      password: hashedPassword,
      weeklyGoal: 40,
      dailyGoal: 8,
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Generate 90 days of logs
  const today = startOfDay(new Date());
  const logs = [];

  for (let i = 89; i >= 0; i--) {
    const date = subDays(today, i);

    // Skip ~15% of days to simulate inconsistency
    if (Math.random() < 0.15) continue;

    // Create a trend: improvement over time with some variance
    const progressFactor = (90 - i) / 90;
    const studyHours = randomBetween(
      Math.max(2, 4 + progressFactor * 3 - Math.random() * 2),
      Math.min(12, 5 + progressFactor * 4),
      1
    );
    const moodScore = Math.round(randomBetween(4 + progressFactor * 2, 9, 0));
    const focusScore = Math.round(randomBetween(4 + progressFactor * 2, 9, 0));
    const sleepHours = randomBetween(5, 9, 1);
    const exerciseCompleted = Math.random() > 0.5;
    const distractionHours = randomBetween(0, 3 - progressFactor * 1.5, 1);
    const notes =
      Math.random() > 0.6
        ? [
            "Great focus session today!",
            "Struggled with distractions in the afternoon.",
            "Completed all planned tasks.",
            "Need to sleep earlier tomorrow.",
            "Had a productive morning.",
            "Feeling motivated and energized.",
            "Worked on difficult problem sets.",
            "Review session — consolidated previous topics.",
          ][Math.floor(Math.random() * 8)]
        : null;

    const productivityScore = computeProductivityScore(
      studyHours,
      focusScore,
      moodScore,
      sleepHours,
      exerciseCompleted,
      distractionHours,
      8
    );

    logs.push({
      userId: user.id,
      date,
      studyHours,
      moodScore,
      focusScore,
      sleepHours,
      exerciseCompleted,
      distractionHours,
      notes,
      productivityScore,
    });
  }

  await prisma.dailyLog.createMany({ data: logs });
  console.log(`✅ Created ${logs.length} daily logs`);

  // Generate insights
  await prisma.insight.createMany({
    data: [
      {
        userId: user.id,
        type: "positive",
        category: "focus",
        message:
          "Your focus score has improved by an average of 2 points over the last 7 days. Keep it up!",
        read: false,
      },
      {
        userId: user.id,
        type: "warning",
        category: "sleep",
        message:
          "Your average sleep this week was only 6.2 hours. Aim for 7–8 hours to boost cognitive performance.",
        read: false,
      },
      {
        userId: user.id,
        type: "positive",
        category: "streak",
        message:
          "You've maintained a 5-day logging streak! Consistency is key to long-term productivity.",
        read: true,
      },
      {
        userId: user.id,
        type: "motivation",
        category: "general",
        message:
          "You've logged 78 out of the last 90 days — that's an 87% consistency rate. Excellent commitment!",
        read: false,
      },
    ],
  });
  console.log("✅ Created sample insights");

  console.log("\n🎉 Seed complete!");
  console.log("📧 Login: alex@flowstate.app");
  console.log("🔑 Password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
