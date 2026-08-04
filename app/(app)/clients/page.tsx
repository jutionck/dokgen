import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientForm } from "@/components/clients/client-form";
import { Pagination } from "@/components/ui/pagination";
import { Users } from "lucide-react";
import { getCompany, listClientsPage, PAGE_SIZE } from "@/lib/data";

export default async function ClientsPage({ searchParams }: PageProps<"/clients">) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);

  const companyData = await getCompany();
  const company = companyData!.company;
  const { rows: clients, total, totalPages } = await listClientsPage(company.id, page);

  const buildHref = (p: number) => (p <= 1 ? "/clients" : `/clients?page=${p}`);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Klien</h1>
          <p className="text-sm text-muted-foreground">Data pelanggan untuk dokumen penawaran, invoice, dan lainnya.</p>
        </div>
        <ClientForm mode="create" trigger={<Button>+ Tambah Klien</Button>} />
      </div>

      <Card className="overflow-hidden">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium">Belum ada klien</p>
            <p className="text-sm text-muted-foreground">Tambahkan klien pertama Anda untuk mulai membuat dokumen.</p>
          </div>
        ) : (
          <>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Perusahaan</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.company || "-"}</TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                      <TableCell>{client.email || "-"}</TableCell>
                      <TableCell className="text-right">
                        <ClientForm mode="edit" client={client} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
          </>
        )}
      </Card>
    </div>
  );
}