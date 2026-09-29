CREATE TABLE "Label" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssignmentLabel" (
    "assignmentId" UUID NOT NULL,
    "labelId" UUID NOT NULL,
    CONSTRAINT "AssignmentLabel_pkey" PRIMARY KEY ("assignmentId","labelId")
);

CREATE UNIQUE INDEX "Label_name_key" ON "Label"("name");

ALTER TABLE "AssignmentLabel" ADD CONSTRAINT "AssignmentLabel_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentLabel" ADD CONSTRAINT "AssignmentLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
