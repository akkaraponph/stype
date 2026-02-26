-- CreateTable
CREATE TABLE "CustomWord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomWord_userId_word_language_key" ON "CustomWord"("userId", "word", "language");

-- CreateIndex
CREATE INDEX "CustomWord_userId_idx" ON "CustomWord"("userId");

-- CreateIndex
CREATE INDEX "CustomWord_userId_language_level_idx" ON "CustomWord"("userId", "language", "level");

-- AddForeignKey
ALTER TABLE "CustomWord" ADD CONSTRAINT "CustomWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
