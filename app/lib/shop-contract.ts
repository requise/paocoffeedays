import { z } from "zod";

export const money = (centavos: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(centavos / 100);
export const paymentMethods = ["gcash", "bank_transfer", "cod"] as const;
export type PaymentMethod = typeof paymentMethods[number];
export const paymentLabels: Record<PaymentMethod, string> = { gcash: "GCash transfer", bank_transfer: "Bank transfer", cod: "Cash on delivery" };
const amount = z.number().int().min(0).max(100_000_000);
export const settingsSchema = z.object({
  revision: z.number().int().positive(),
  enabled: z.boolean(),
  priceCentavos: amount,
  stock: z.number().int().min(0).max(100000),
  maxQuantity: z.number().int().min(1).max(100),
  zones: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]{1,40}$/), name: z.string().trim().min(2).max(80), feeCentavos: amount, cities: z.array(z.string().trim().min(2).max(80)).min(1).max(200) })).max(20),
  methods: z.array(z.enum(paymentMethods)).max(3),
  instructions: z.object({ gcash: z.string().trim().max(1500), bank_transfer: z.string().trim().max(1500) }),
  ownerEmail: z.union([z.literal(""), z.email()]),
}).strict().superRefine((s, ctx) => {
  if (new Set(s.zones.map(z => z.id)).size !== s.zones.length) ctx.addIssue({ code: "custom", message: "Delivery zone IDs must be unique." });
  if (new Set(s.methods).size !== s.methods.length) ctx.addIssue({ code: "custom", message: "Payment methods must be unique." });
  if (s.enabled) {
    if (s.priceCentavos < 100) ctx.addIssue({ code: "custom", message: "Set the actual product price before opening checkout." });
    if (!s.zones.length || !s.methods.length) ctx.addIssue({ code: "custom", message: "Add a delivery zone and a payment method before opening checkout." });
    for (const m of s.methods) if (m !== "cod" && !s.instructions[m]) ctx.addIssue({ code: "custom", message: `Add ${paymentLabels[m]} instructions.` });
  }
});
export type ShopSettings = z.infer<typeof settingsSchema>;
export const defaultSettings: ShopSettings = { revision: 1, enabled: false, priceCentavos: 0, stock: 0, maxQuantity: 5, zones: [], methods: [], instructions: { gcash: "", bank_transfer: "" }, ownerEmail: "" };
export type Catalog = {
  ready: boolean; message: string; product: { name: string; size: string; image: string; priceCentavos: number; stock: number; maxQuantity: number };
  zones: ShopSettings["zones"]; methods: PaymentMethod[];
};
export const orderInputSchema = z.object({
  idempotencyKey: z.uuid(), quantity: z.number().int().min(1).max(100),
  expectedTotalCentavos: amount,
  name: z.string().trim().min(2).max(100), email: z.email().max(200).transform(v => v.toLowerCase()),
  phone: z.string().trim().regex(/^(?:\+63|0)9\d{9}$/, "Use a Philippine mobile number, such as 09171234567."),
  address: z.string().trim().min(8).max(400), city: z.string().trim().min(2).max(80),
  postalCode: z.string().regex(/^\d{4}$/, "Enter a four-digit postal code."),
  zoneId: z.string().max(40), paymentMethod: z.enum(paymentMethods), notes: z.string().trim().max(500).default(""),
  website: z.string().max(0).optional(),
}).strict();
export type OrderInput = z.infer<typeof orderInputSchema>;
export const paymentStatuses = ["awaiting_payment", "reference_submitted", "paid", "cod_due", "cancelled"] as const;
export const fulfillmentStatuses = ["new", "processing", "shipped", "completed", "cancelled"] as const;
export type Order = {
  id: string; reference: string; createdAt: string; quantity: number; unitPriceCentavos: number; shippingCentavos: number; totalCentavos: number;
  name: string; email: string; phone: string; address: string; city: string; postalCode: string; zoneName: string; notes: string;
  paymentMethod: PaymentMethod; paymentStatus: typeof paymentStatuses[number]; fulfillmentStatus: typeof fulfillmentStatuses[number];
  paymentReference: string; paymentInstructions: string; trackingNumber: string; expiresAt: string | null; version: number;
};
export const updateOrderSchema = z.object({ version: z.number().int().positive(), action: z.enum(["mark_paid", "process", "ship", "complete", "cancel"]), trackingNumber: z.string().trim().max(150).optional() }).strict();
export type UpdateOrder = z.infer<typeof updateOrderSchema>;
export type AdminSnapshot = { settings: ShopSettings; orders: Order[]; hasMore: boolean; notifications: { pending: number; failed: number }; emailConfigured: boolean; databaseMode: "postgres" | "local" };
