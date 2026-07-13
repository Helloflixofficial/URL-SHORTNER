"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Save, Plus, Trash2 } from "lucide-react";

// Map of Ad Types to their DB keys
const AD_TYPES = [
  {
    id: "interstitial",
    label: "Interstitial CPM",
    key: "payout_rates_interstitial",
  },
  { id: "banner", label: "Banner CPM", key: "payout_rates_banner" },
  { id: "popup", label: "Popup CPM", key: "payout_rates_popup" },
];

// Device map (matches Adlinkfly/Linksite logic, typically 1=Desktop, 2=Mobile, 3=Tablet or 1,2,3 mapped as generic tiers)
const DEVICE_TIERS = ["1", "2", "3"];

interface RateMatrix {
  [countryCode: string]: { [deviceTier: string]: number };
}

interface Props {
  interstitial: RateMatrix;
  banner: RateMatrix;
  popup: RateMatrix;
}

export default function PayoutRatesEditor({
  interstitial,
  banner,
  popup,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [newCountry, setNewCountry] = useState("");

  // State for each ad type's matrix
  const [matrices, setMatrices] = useState<Record<string, RateMatrix>>({
    interstitial,
    banner,
    popup,
  });

  const handleUpdate = (
    adType: string,
    country: string,
    device: string,
    value: string
  ) => {
    const val = parseFloat(value) || 0;
    setMatrices((prev) => ({
      ...prev,
      [adType]: {
        ...prev[adType],
        [country]: {
          ...prev[adType]?.[country],
          [device]: val,
        },
      },
    }));
  };

  const addCountry = (adType: string) => {
    if (!newCountry.trim()) return;
    const c = newCountry.trim().toUpperCase();
    if (matrices[adType][c]) return toast.error("Country already exists");

    setMatrices((prev) => ({
      ...prev,
      [adType]: { ...prev[adType], [c]: { "1": 0, "2": 0, "3": 0 } },
    }));
    setNewCountry("");
  };

  const removeCountry = (adType: string, country: string) => {
    setMatrices((prev) => {
      const next = { ...prev };
      const matrix = { ...next[adType] };
      delete matrix[country];
      next[adType] = matrix;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        payout_rates_interstitial: JSON.stringify(matrices.interstitial),
        payout_rates_banner: JSON.stringify(matrices.banner),
        payout_rates_popup: JSON.stringify(matrices.popup),
      };
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Payout rates updated!");
      router.refresh();
    } catch {
      toast.error("Failed to save rates");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <Button
          onClick={save}
          disabled={saving}
          className="btn-glow gradient-bg-primary text-primary-foreground"
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Rates
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="interstitial">
        <TabsList className="glass border border-border/50 p-1 h-auto mb-4">
          {AD_TYPES.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {AD_TYPES.map((type) => {
          const matrix = matrices[type.id] || {};
          const countries = Object.keys(matrix).sort((a, b) =>
            a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b)
          );

          return (
            <TabsContent key={type.id} value={type.id}>
              <Card className="glass border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{type.label}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="e.g. US, GB, IN"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className="w-32 h-8 text-xs glass border-border/50"
                      maxLength={2}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 glass"
                      onClick={() => addCountry(type.id)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Country
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-border/50 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/20">
                        <TableRow className="border-border/30">
                          <TableHead className="w-32">Country</TableHead>
                          <TableHead>Desktop (Tier 1)</TableHead>
                          <TableHead>Mobile (Tier 2)</TableHead>
                          <TableHead>Tablet (Tier 3)</TableHead>
                          <TableHead className="w-16" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {countries.map((c) => (
                          <TableRow key={c} className="border-border/30">
                            <TableCell className="font-semibold">
                              {c === "all"
                                ? "Worldwide Deal (all)"
                                : c.toUpperCase()}
                            </TableCell>
                            {DEVICE_TIERS.map((d) => (
                              <TableCell key={d}>
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                                    $
                                  </span>
                                  <Input
                                    type="number"
                                    step="0.0001"
                                    value={matrix[c]?.[d] || 0}
                                    onChange={(e) =>
                                      handleUpdate(
                                        type.id,
                                        c,
                                        d,
                                        e.target.value
                                      )
                                    }
                                    className="pl-6 h-8 text-xs glass border-border/50"
                                  />
                                </div>
                              </TableCell>
                            ))}
                            <TableCell>
                              {c !== "all" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => removeCountry(type.id, c)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Values represent CPM (Cost Per 1000 views). &quot;all&quot;
                    is used as the fallback rate for countries not explicitly
                    listed.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
