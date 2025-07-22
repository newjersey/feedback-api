-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at_from_api" TIMESTAMPTZ(3) NOT NULL,
    "rating" BOOLEAN NOT NULL,
    "page_url" TEXT NOT NULL,
    "comment" TEXT,
    "email" TEXT,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_pageUrl_createdAt_idx" ON "Feedback"("pageUrl" text_pattern_ops, "createdAt");