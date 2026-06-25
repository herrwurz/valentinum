-- CreateTable
CREATE TABLE "ResourceGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceGroupMember" (
    "id" TEXT NOT NULL,
    "resourceGroupId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,

    CONSTRAINT "ResourceGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResourceGroupMember_resourceId_idx" ON "ResourceGroupMember"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceGroupMember_resourceGroupId_resourceId_key" ON "ResourceGroupMember"("resourceGroupId", "resourceId");

-- AddForeignKey
ALTER TABLE "ResourceGroupMember" ADD CONSTRAINT "ResourceGroupMember_resourceGroupId_fkey" FOREIGN KEY ("resourceGroupId") REFERENCES "ResourceGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResourceGroupMember" ADD CONSTRAINT "ResourceGroupMember_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
