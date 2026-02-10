import { useState } from 'react'

import { createServerFn } from '@tanstack/react-start'

import {
  BuildingIcon,
  CreditCardIcon,
  Loader2Icon,
  SmartphoneIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  createPaymentSource,
  createWompiTransaction,
  getWompiPSEBanks,
  tokenizeCard,
} from '@/lib/wompi'

// --- Server functions wrapping Wompi API calls ---

const serverCreateTransaction = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      amountInCents: number
      customerEmail: string
      reference: string
      paymentMethod: 'NEQUI' | 'CARD' | 'PSE'
      redirectUrl: string
      paymentSourceId?: string
    }) => data,
  )
  .handler(async ({ data }) => {
    return createWompiTransaction({
      amountInCents: data.amountInCents,
      currency: 'COP',
      customerEmail: data.customerEmail,
      reference: data.reference,
      paymentMethod: data.paymentMethod,
      redirectUrl: data.redirectUrl,
      paymentSourceId: data.paymentSourceId,
    })
  })

const serverGetPSEBanks = createServerFn({ method: 'GET' }).handler(
  async () => {
    return getWompiPSEBanks()
  },
)

const serverTokenizeCard = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      number: string
      cvc: string
      expMonth: string
      expYear: string
      cardHolder: string
    }) => data,
  )
  .handler(async ({ data }) => {
    return tokenizeCard(data)
  })

const serverCreatePaymentSource = createServerFn({ method: 'POST' })
  .validator(
    (data: { token: string; customerEmail: string; acceptanceToken: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    return createPaymentSource({
      type: 'CARD',
      token: data.token,
      customerEmail: data.customerEmail,
      acceptanceToken: data.acceptanceToken,
    })
  })

// --- Types ---

type WompiCheckoutProps = {
  amountInCents: number
  currency: 'COP'
  reference: string
  customerEmail: string
  organizationId: string
  onSuccess: () => void
  onError: (error: string) => void
}

type PSEBank = {
  financial_institution_code: string
  financial_institution_name: string
}

// --- Formatters ---

const COP_FORMAT = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function formatAmount(cents: number): string {
  return COP_FORMAT.format(cents / 100)
}

// --- Component ---

export function WompiCheckout({
  amountInCents,
  reference,
  customerEmail,
  onSuccess,
  onError,
}: WompiCheckoutProps) {
  const formattedAmount = formatAmount(amountInCents)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-2xl font-bold">{formattedAmount} COP</p>
      </div>

      <Tabs defaultValue="nequi">
        <TabsList className="w-full">
          <TabsTrigger value="nequi" className="flex-1 gap-1.5">
            <SmartphoneIcon className="h-4 w-4" />
            Nequi
          </TabsTrigger>
          <TabsTrigger value="card" className="flex-1 gap-1.5">
            <CreditCardIcon className="h-4 w-4" />
            Tarjeta
          </TabsTrigger>
          <TabsTrigger value="pse" className="flex-1 gap-1.5">
            <BuildingIcon className="h-4 w-4" />
            PSE
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nequi">
          <NequiTab
            amountInCents={amountInCents}
            reference={reference}
            customerEmail={customerEmail}
            onSuccess={onSuccess}
            onError={onError}
          />
        </TabsContent>

        <TabsContent value="card">
          <CardTab
            amountInCents={amountInCents}
            reference={reference}
            customerEmail={customerEmail}
            onSuccess={onSuccess}
            onError={onError}
          />
        </TabsContent>

        <TabsContent value="pse">
          <PSETab
            amountInCents={amountInCents}
            reference={reference}
            customerEmail={customerEmail}
            onSuccess={onSuccess}
            onError={onError}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// --- Nequi Tab ---

type TabProps = {
  amountInCents: number
  reference: string
  customerEmail: string
  onSuccess: () => void
  onError: (error: string) => void
}

function NequiTab({
  amountInCents,
  reference,
  customerEmail,
  onSuccess,
  onError,
}: TabProps) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [waitingApproval, setWaitingApproval] = useState(false)

  const isValid = /^3\d{9}$/.test(phone)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await serverCreateTransaction({
        data: {
          amountInCents,
          customerEmail,
          reference,
          paymentMethod: 'NEQUI',
          redirectUrl: window.location.href,
        },
      })

      if (result.data?.id) {
        setWaitingApproval(true)
        // Webhook will handle the result
        // Show waiting state, user approves in Nequi app
        setTimeout(() => onSuccess(), 60000) // Fallback timeout
      } else {
        onError(result.error?.reason ?? 'Error al procesar pago con Nequi')
      }
    } catch {
      onError('Error al conectar con Nequi')
    } finally {
      setLoading(false)
    }
  }

  if (waitingApproval) {
    return (
      <div className="space-y-4 py-6 text-center">
        <Loader2Icon className="text-primary mx-auto h-8 w-8 animate-spin" />
        <p className="font-medium">Aprueba el pago en tu app Nequi</p>
        <p className="text-muted-foreground text-sm">
          Abre la app de Nequi y acepta la solicitud de pago.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="nequi-phone">Número de celular</Label>
        <Input
          id="nequi-phone"
          type="tel"
          placeholder="3001234567"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
        />
        <p className="text-muted-foreground text-xs">
          Número registrado en Nequi (10 dígitos)
        </p>
      </div>

      <Button
        className="w-full"
        disabled={!isValid || loading}
        onClick={handleSubmit}
      >
        {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
        Pagar con Nequi
      </Button>
    </div>
  )
}

// --- Card Tab ---

function CardTab({
  amountInCents,
  reference,
  customerEmail,
  onSuccess,
  onError,
}: TabProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [loading, setLoading] = useState(false)

  const isValid =
    cardNumber.replace(/\s/g, '').length >= 15 &&
    /^\d{2}\/\d{2}$/.test(expiry) &&
    cvc.length >= 3 &&
    cardHolder.trim().length > 0

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const [expMonth, expYear] = expiry.split('/')

      // Step 1: Tokenize card
      const tokenResult = await serverTokenizeCard({
        data: {
          number: cardNumber.replace(/\s/g, ''),
          cvc,
          expMonth,
          expYear,
          cardHolder,
        },
      })

      if (!tokenResult.data?.id) {
        onError(tokenResult.error?.reason ?? 'Error al procesar tarjeta')
        return
      }

      // Step 2: Create payment source (saves card for recurring)
      const sourceResult = await serverCreatePaymentSource({
        data: {
          token: tokenResult.data.id,
          customerEmail,
          acceptanceToken: tokenResult.data.acceptance_token ?? '',
        },
      })

      if (!sourceResult.data?.id) {
        onError(sourceResult.error?.reason ?? 'Error al guardar tarjeta')
        return
      }

      // Step 3: Create transaction with saved payment source
      const txResult = await serverCreateTransaction({
        data: {
          amountInCents,
          customerEmail,
          reference,
          paymentMethod: 'CARD',
          redirectUrl: window.location.href,
          paymentSourceId: sourceResult.data.id,
        },
      })

      if (txResult.data?.id) {
        onSuccess()
      } else {
        onError(txResult.error?.reason ?? 'Error al procesar pago')
      }
    } catch {
      onError('Error al procesar pago con tarjeta')
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    return digits.replace(/(\d{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4)
    }
    return digits
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="card-holder">Nombre del titular</Label>
        <Input
          id="card-holder"
          placeholder="Como aparece en la tarjeta"
          value={cardHolder}
          onChange={(e) => setCardHolder(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-number">Número de tarjeta</Label>
        <Input
          id="card-number"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="card-expiry">Vencimiento</Label>
          <Input
            id="card-expiry"
            placeholder="MM/YY"
            maxLength={5}
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="card-cvc">CVC</Label>
          <Input
            id="card-cvc"
            type="password"
            placeholder="123"
            maxLength={4}
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      <Badge variant="secondary" className="w-full justify-center py-1.5">
        Tu tarjeta se guardará para pagos futuros
      </Badge>

      <Button
        className="w-full"
        disabled={!isValid || loading}
        onClick={handleSubmit}
      >
        {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
        Pagar con tarjeta
      </Button>
    </div>
  )
}

// --- PSE Tab ---

function PSETab({
  amountInCents,
  reference,
  customerEmail,
  onSuccess,
  onError,
}: TabProps) {
  const [banks, setBanks] = useState<Array<PSEBank>>([])
  const [banksLoading, setBanksLoading] = useState(false)
  const [banksLoaded, setBanksLoaded] = useState(false)
  const [selectedBank, setSelectedBank] = useState('')
  const [personType, setPersonType] = useState<'0' | '1'>('0') // 0=Natural, 1=Juridica
  const [docType, setDocType] = useState('CC')
  const [docNumber, setDocNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const loadBanks = async () => {
    if (banksLoaded) return
    setBanksLoading(true)
    try {
      const result = await serverGetPSEBanks()
      setBanks(result.data ?? [])
      setBanksLoaded(true)
    } catch {
      onError('Error al cargar bancos PSE')
    } finally {
      setBanksLoading(false)
    }
  }

  // Load banks on first render
  if (!banksLoaded && !banksLoading) {
    void loadBanks()
  }

  const isValid = selectedBank && docNumber.trim().length > 0

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await serverCreateTransaction({
        data: {
          amountInCents,
          customerEmail,
          reference,
          paymentMethod: 'PSE',
          redirectUrl: window.location.href,
        },
      })

      if (result.data?.payment_method?.extra?.async_payment_url) {
        // Redirect to bank for PSE approval
        window.location.href =
          result.data.payment_method.extra.async_payment_url
      } else if (result.data?.id) {
        onSuccess()
      } else {
        onError(result.error?.reason ?? 'Error al procesar pago PSE')
      }
    } catch {
      onError('Error al conectar con PSE')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="pse-bank">Banco</Label>
        {banksLoading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2Icon className="h-4 w-4 animate-spin" />
            <span className="text-muted-foreground text-sm">
              Cargando bancos...
            </span>
          </div>
        ) : (
          <Select value={selectedBank} onValueChange={setSelectedBank}>
            <SelectTrigger id="pse-bank">
              <SelectValue placeholder="Selecciona tu banco" />
            </SelectTrigger>
            <SelectContent>
              {banks.map((bank) => (
                <SelectItem
                  key={bank.financial_institution_code}
                  value={bank.financial_institution_code}
                >
                  {bank.financial_institution_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tipo de persona</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="person-type"
              value="0"
              checked={personType === '0'}
              onChange={() => setPersonType('0')}
            />
            <span className="text-sm">Natural</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="person-type"
              value="1"
              checked={personType === '1'}
              onChange={() => setPersonType('1')}
            />
            <span className="text-sm">Jurídica</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pse-doc-type">Tipo doc.</Label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger id="pse-doc-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CC">CC</SelectItem>
              <SelectItem value="NIT">NIT</SelectItem>
              <SelectItem value="CE">CE</SelectItem>
              <SelectItem value="PP">PP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="pse-doc-number">Número de documento</Label>
          <Input
            id="pse-doc-number"
            placeholder="Número de documento"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>

      <Badge variant="secondary" className="w-full justify-center py-1.5">
        Serás redirigido a tu banco
      </Badge>

      <Button
        className="w-full"
        disabled={!isValid || loading}
        onClick={handleSubmit}
      >
        {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
        Pagar con PSE
      </Button>
    </div>
  )
}
