import { z } from 'zod';

export const bookingSearchSchema = z.object({
  checkIn: z
    .string()
    .optional(),
  checkOut: z
    .string()
    .optional(),
  capacity: z
    .string()
    .optional(),
  roomType: z
    .string()
    .optional(),
  priceMin: z
    .string()
    .optional(),
  priceMax: z
    .string()
    .optional(),
});

export type BookingSearchFormData = z.infer<typeof bookingSearchSchema>;

export const createBookingSchema = z.object({
  roomId: z
    .number()
    .int()
    .positive({ message: "Room ID is required" }),
  checkInDate: z
    .string()
    .min(1, { message: "Check-in date is required" }),
  checkOutDate: z
    .string()
    .min(1, { message: "Check-out date is required" }),
  guestCount: z
    .number()
    .int()
    .min(1, { message: "At least 1 guest is required" }),
  specialRequests: z
    .string()
    .optional(),
})
.refine(
  (data) => {
    // Ensure check-out date is after check-in date
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);
    return checkOut > checkIn;
  },
  {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  }
);

export type CreateBookingFormData = z.infer<typeof createBookingSchema>;

export const paymentSchema = z.object({
  paymentMethod: z
    .enum(["credit_card", "debit_card", "paypal"], {
      required_error: "Payment method is required",
    }),
  cardNumber: z
    .string()
    .min(1, { message: "Card number is required" })
    .regex(/^\d{16}$/, { message: "Card number must be 16 digits" })
    .optional()
    .or(z.literal("")),
  cardHolderName: z
    .string()
    .min(1, { message: "Cardholder name is required" })
    .optional()
    .or(z.literal("")),
  expiryMonth: z
    .string()
    .min(1, { message: "Expiry month is required" })
    .regex(/^(0[1-9]|1[0-2])$/, { message: "Expiry month must be between 01-12" })
    .optional()
    .or(z.literal("")),
  expiryYear: z
    .string()
    .min(1, { message: "Expiry year is required" })
    .regex(/^\d{4}$/, { message: "Expiry year must be 4 digits" })
    .optional()
    .or(z.literal("")),
  cvv: z
    .string()
    .min(1, { message: "CVV is required" })
    .regex(/^\d{3,4}$/, { message: "CVV must be 3 or 4 digits" })
    .optional()
    .or(z.literal("")),
})
.refine(
  (data) => {
    if (data.paymentMethod === "credit_card" || data.paymentMethod === "debit_card") {
      return !!data.cardNumber && !!data.cardHolderName && !!data.expiryMonth && !!data.expiryYear && !!data.cvv;
    }
    return true;
  },
  {
    message: "Card details are required for credit/debit card payments",
    path: ["cardNumber"],
  }
);

export type PaymentFormData = z.infer<typeof paymentSchema>; 