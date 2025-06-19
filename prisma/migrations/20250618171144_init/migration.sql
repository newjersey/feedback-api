-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "createdTime" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" BOOLEAN NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "comment" TEXT,
    "email" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
