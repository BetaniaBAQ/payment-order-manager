interface WompiWidgetConfig {
  currency: 'COP'
  amountInCents: number
  reference: string
  publicKey: string
  signature: { integrity: string }
  redirectUrl?: string
  expirationTime?: string
  taxInCents?: { vat?: number; consumption?: number }
  customerData?: {
    email?: string
    fullName?: string
    phoneNumber?: string
    phoneNumberPrefix?: string
    legalId?: string
    legalIdType?: 'CC' | 'CE' | 'NIT' | 'PP' | 'TI' | 'DNI' | 'RG' | 'OTHER'
  }
  shippingAddress?: {
    addressLine1?: string
    addressLine2?: string
    city?: string
    region?: string
    country?: string
    phoneNumber?: string
    name?: string
    postalCode?: string
  }
}

interface WompiTransaction {
  id: string
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING'
  reference: string
  amountInCents: number
  currency: string
  paymentMethodType: string
}

declare class WidgetCheckout {
  constructor(config: WompiWidgetConfig)
  open(callback: (result: { transaction: WompiTransaction }) => void): void
}

declare const $wompi: {
  initialize: (
    callback: (
      data: { sessionId: string; deviceData: { deviceID: string } },
      error: unknown,
    ) => void,
  ) => void
}
