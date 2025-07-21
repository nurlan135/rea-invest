-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('OWNER', 'BUYER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CIXARIS', 'MUQAVILE', 'SERENCAM');

-- CreateEnum
CREATE TYPE "RepairStatus" AS ENUM ('TEMIRLI', 'TEMIRSIZ');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HEYET_EVI', 'OBYEKT', 'MENZIL', 'TORPAQ');

-- CreateEnum
CREATE TYPE "PropertyPurpose" AS ENUM ('SATIS', 'ICARE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('YENI', 'GOZLEMEDE', 'BEH_VERILIB', 'SATILIB', 'ICAREYE_VERILIB');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AGENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fatherName" TEXT,
    "phone" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "district" TEXT NOT NULL,
    "projectName" TEXT,
    "streetAddress" TEXT NOT NULL,
    "apartmentNumber" TEXT,
    "roomCount" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "floor" INTEGER NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "repairStatus" "RepairStatus" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "purpose" "PropertyPurpose" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'YENI',
    "lastFollowUpDate" TIMESTAMP(3),
    "notes" TEXT,
    "ownerId" INTEGER NOT NULL,
    "agentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "purchasePrice" DECIMAL(65,30),
    "repairExpense" DECIMAL(65,30) DEFAULT 0,
    "documentationExpense" DECIMAL(65,30) DEFAULT 0,
    "interestExpense" DECIMAL(65,30) DEFAULT 0,
    "otherExpense" DECIMAL(65,30) DEFAULT 0,
    "salePrice" DECIMAL(65,30),
    "serviceFee" DECIMAL(65,30),
    "saleDate" TIMESTAMP(3),
    "profit" DECIMAL(65,30),
    "buyerId" INTEGER,
    "purchasingEntity" TEXT NOT NULL DEFAULT 'REA INVEST',
    "agentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "depositDate" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_phone_key" ON "Contact"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Property_documentNumber_key" ON "Property"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_propertyId_key" ON "Transaction"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Deposit_transactionId_key" ON "Deposit"("transactionId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
