-- CreateTable
CREATE TABLE "Quotation" (
    "id" SERIAL NOT NULL,
    "quotation_number" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "sales_representative_id" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL,
    "last_contact_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quotation_quotation_number_key" ON "Quotation"("quotation_number");

-- AddForeignKey
ALTER TABLE "Quotation" ADD CONSTRAINT "Quotation_sales_representative_id_fkey" FOREIGN KEY ("sales_representative_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
