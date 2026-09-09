-- CreateTable
CREATE TABLE "doctor_time_blocks" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_time_blocks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "doctor_time_blocks" ADD CONSTRAINT "doctor_time_blocks_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
