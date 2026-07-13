import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, ChevronLeft, ChevronRight, Copy, Share2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const metadata = { title: "My Referrals" };

export default async function MemberReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id!;

  const params = await searchParams;
  const page = parseInt(params.page || "1") || 1;
  const pageSize = 20;

  const [total, referrals] = await Promise.all([
    prisma.user.count({ where: { referralId: userId } }),
    prisma.user.findMany({
      where: { referralId: userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, username: true, createdAt: true },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const referralLink = `${baseUrl}/ref/${session.user.name}`; // Or a user-specific token if preferred. Assuming username for now.

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center gradient-bg-primary">
          <Users className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-black font-display">
            My <span className="gradient-text">Referrals</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Invite friends and earn a percentage of their earnings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Referral Link Card */}
        <Card className="glass border-border/50 md:col-span-1">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" /> Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this link to invite users. You will earn a bonus from their
              activity.
            </p>

            <div className="space-y-1.5">
              <div className="relative">
                <Input
                  readOnly
                  value={referralLink}
                  className="pr-10 glass border-border/50 bg-muted/50"
                />
                {/* Normally we'd use a client component for copy to clipboard, this is a simplified visual representation */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7 text-muted-foreground"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
              <p className="text-sm font-semibold text-primary mb-1">
                Referral Rate: 20%
              </p>
              <p className="text-xs text-muted-foreground">
                You receive 20% of the earnings from users who sign up via your
                link for life.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Table Card */}
        <Card className="glass border-border/50 md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Referred Users ({total}
              )
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 bg-muted/20">
                    <TableHead>Username</TableHead>
                    <TableHead>Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center py-8 text-muted-foreground"
                      >
                        You haven&apos;t referred anyone yet. Share your link to
                        start earning!
                      </TableCell>
                    </TableRow>
                  ) : (
                    referrals.map((u) => (
                      <TableRow
                        key={u.id}
                        className="border-border/30 table-row-hover"
                      >
                        <TableCell className="font-medium">
                          {u.username}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(u.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    asChild
                    className="glass"
                  >
                    <Link href={`/referrals?page=${page - 1}`}>
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    asChild
                    className="glass"
                  >
                    <Link href={`/referrals?page=${page + 1}`}>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
