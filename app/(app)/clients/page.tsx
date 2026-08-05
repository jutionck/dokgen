import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientForm } from "@/components/clients/client-form";
import { Pagination } from "@/components/ui/pagination";
import { Building2, Mail, Phone, Plus, Users } from "lucide-react";
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
        <ClientForm
          mode="create"
          trigger={
            <Button>
              <Plus /> Tambah Klien
            </Button>
          }
        />
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
            {/* ===== Tabel: tablet & desktop ===== */}
            <CardContent className="hidden p-0 sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Klien / Perusahaan</TableHead>
                    <TableHead>Penanggung Jawab</TableHead>
                    <TableHead>Kontak & Email</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-semibold text-xs">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{client.company || client.name}</p>
                            {client.company && client.address && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{client.address}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium text-slate-700">{client.name}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 text-xs text-slate-600">
                          {client.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              <a href={`mailto:${client.email}`} className="hover:underline text-blue-600 font-medium">
                                {client.email}
                              </a>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          {!client.email && !client.phone && <span className="text-slate-400">-</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <ClientForm mode="edit" client={client} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>

            {/* ===== List: mobile (native-style) ===== */}
            <CardContent className="p-0 sm:hidden">
              <ul className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <li
                    key={client.id}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors active:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Building2 className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{client.company || client.name}</p>
                        {client.company && <p className="truncate text-xs text-slate-500">{client.name}</p>}
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          {client.email && <span className="truncate">{client.email}</span>}
                          {client.phone && (
                            <>
                              {client.email && <span className="text-slate-300">·</span>}
                              <span>{client.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <ClientForm mode="edit" client={client} />
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </>
        )}
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
      </Card>
    </div>
  );
}
