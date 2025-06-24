-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" BOOLEAN NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "comment" TEXT,
    "email" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_pageUrl_createdAt_idx" ON "Feedback"("pageUrl" text_pattern_ops, "createdAt");
