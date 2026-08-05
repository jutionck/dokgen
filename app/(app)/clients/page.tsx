import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientForm } from "@/components/clients/client-form";
import { Pagination } from "@/components/ui/pagination";
import { Building2, Mail, MapPin, Phone, PlusCircle, Users } from "lucide-react";
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
      {/* ===== Header & Action ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Klien</h1>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700"
            >
              {total} Klien
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola daftar dan data kontak pelanggan untuk mempercepat pembuatan faktur & surat penawaran.
          </p>
        </div>
        <ClientForm
          mode="create"
          trigger={
            <Button
              size="lg"
              className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/25 shrink-0 active:scale-[0.98] transition-all"
            >
              <PlusCircle className="h-5 w-5 mr-1.5" /> Tambah Klien
            </Button>
          }
        />
      </div>

      {/* ===== Card Main Content ===== */}
      <Card className="border-slate-200/80 shadow-xs rounded-2xl overflow-hidden">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3 border border-blue-100 shadow-2xs">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Belum Ada Data Klien</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-5">
              Tambahkan data pelanggan pertama Anda untuk mempermudah pengisian otomatis pada pembuatan dokumen.
            </p>
            <ClientForm
              mode="create"
              trigger={
                <Button size="sm" className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium">
                  + Tambah Klien Pertama
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* ===== Tabel Desktop & Tablet ===== */}
            <CardContent className="hidden p-0 sm:block">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="border-slate-200/80">
                    <TableHead className="font-semibold text-slate-700">Klien / Perusahaan</TableHead>
                    <TableHead className="font-semibold text-slate-700">Penanggung Jawab (PIC)</TableHead>
                    <TableHead className="font-semibold text-slate-700">Kontak & Email</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {clients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-900">{client.company || client.name}</p>
                            {client.company && client.address && (
                              <p className="text-xs text-slate-500 truncate max-w-[240px] flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                <span className="truncate">{client.address}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-semibold text-slate-800">{client.name}</p>
                        {client.company && <p className="text-xs text-slate-400 font-medium">PIC Perusahaan</p>}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          {client.email && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <a
                                href={`mailto:${client.email}`}
                                className="hover:underline text-blue-600 font-semibold truncate max-w-[180px]"
                              >
                                {client.email}
                              </a>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
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

            {/* ===== List Mobile Touch-Friendly ===== */}
            <CardContent className="p-0 sm:hidden">
              <ul className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <li
                    key={client.id}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 transition-colors active:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                        <Building2 className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{client.company || client.name}</p>
                        {client.company && <p className="truncate text-xs text-slate-500 font-medium">{client.name}</p>}
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          {client.email && <span className="truncate text-blue-600 font-medium">{client.email}</span>}
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
        {clients.length > 0 && (
          <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} buildHref={buildHref} />
        )}
      </Card>
    </div>
  );
}
