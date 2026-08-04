ALTER TABLE "doc_sequences" ADD CONSTRAINT "doc_sequences_pk" PRIMARY KEY("company_id","doc_type","period");--> statement-breakpoint
CREATE INDEX "document_items_document_id_idx" ON "document_items" USING btree ("document_id");--> statement-breakpoint
CREATE INDEX "documents_company_id_idx" ON "documents" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "documents_client_id_idx" ON "documents" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "documents_type_idx" ON "documents" USING btree ("type");--> statement-breakpoint
CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_logs_document_id_idx" ON "email_logs" USING btree ("document_id");--> statement-breakpoint
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_company_user_unique" UNIQUE("company_id","user_id");--> statement-breakpoint
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_user_unique" UNIQUE("user_id");