# Proveedores de Pago LATAM

## Comparación de Proveedores

### PayU - NO RECOMENDADO para suscripciones

- **Pagos recurrentes DEPRECADOS** - solo tokenización manual disponible
- Precios solo bajo solicitud
- Requiere implementación custom para billing recurrente
- Fuente: [PayU Developers](https://developers.payulatam.com/latam/en/deprecated/recurring-payments/recurring-payments-api.html)

---

### Stripe - RECOMENDADO

| País      | Comisión          | Métodos               |
| --------- | ----------------- | --------------------- |
| 🇲🇽 México | **3.6% + $3 MXN** | Tarjetas, OXXO, SPEI  |
| 🇧🇷 Brasil | ~3.99%            | Pix, Boleto, tarjetas |
| 🇨🇱 Chile  | ~3.6%             | Webpay Plus, tarjetas |

**Ventajas:**

- Billing nativo para suscripciones
- Customer Portal incluido
- Webhooks robustos
- Soporte multi-moneda
- Fuente: [Stripe Mexico Pricing](https://www.fernandoabitia.com/calculadora-comision-stripe-mexico/)

---

### MercadoPago - NECESARIO para Argentina

| Plazo acreditación | Comisión    |
| ------------------ | ----------- |
| Inmediato          | 6.29% + IVA |
| 14 días            | 3.79% + IVA |
| 35 días            | 1.49% + IVA |

**Consideraciones:**

- Comisiones varían por provincia (Ingresos Brutos)
- Soporta suscripciones nativas
- Domina el mercado argentino
- Fuente: [MercadoPago Comisiones](https://www.mercadopago.com.ar/ayuda/26748)

---

### dLocal - Alternativa sólida para LATAM

**Comisiones:** 2.7% - 7% (todo incluido según país y método)

| País         | Métodos soportados                                     |
| ------------ | ------------------------------------------------------ |
| 🇧🇷 Brasil    | Pix, Boleto, tarjetas, **Pix Automático** (recurrente) |
| 🇲🇽 México    | OXXO, SPEI, tarjetas                                   |
| 🇦🇷 Argentina | Tarjetas locales, transferencias                       |
| 🇨🇴 Colombia  | PSE, tarjetas, efectivo                                |
| 🇨🇱 Chile     | Webpay, tarjetas                                       |
| 🇵🇪 Perú      | PagoEfectivo, tarjetas                                 |

**Ventajas:**

- Pricing todo incluido (sin sorpresas)
- Sin setup fee ni fee mensual
- SmartPix para Pix recurrente en Brasil (nuevo 2025)
- 40+ países emergentes
- Fuente: [dLocal Go Fees](https://helpcenter.dlocalgo.com/en/articles/6960181-dlocal-go-fees)

**Desventajas:**

- Precios variables (2.7%-7%) requiere negociar
- Menos documentación que Stripe
- Customer Portal no tan pulido

**Cuándo usar dLocal:**

- Colombia (PSE nativo)
- Brasil (Pix Automático para suscripciones)
- Cuando necesites un solo proveedor para todo LATAM

---

### Rebill - Especialista en Suscripciones LATAM (Y Combinator)

**Modelo:** Solo comisión por transacción, sin tiers mensuales.

| País         | Tarjetas      | Transferencias      | Wallets |
| ------------ | ------------- | ------------------- | ------- |
| 🇦🇷 Argentina | 3.79% + $0.20 | 1.90%               | 1.90%   |
| 🇧🇷 Brasil    | 5.50% + $0.20 | Pix: 1.00% + $0.50  | -       |
| 🇨🇱 Chile     | 3.90% + $0.10 | -                   | -       |
| 🇨🇴 Colombia  | 4.20% + $0.20 | PSE: 1.50% + $0.30  | -       |
| 🇲🇽 México    | 3.50% + $0.20 | SPEI: 1.00% + $0.20 | -       |

**Costos adicionales:**

- Mínimo mensual: **$500 USD** (cross-border)
- Refunds: $2 c/u
- Chargebacks: $15 c/u
- Retiro < $5K: $10

**Ventajas:**

- Especializado en suscripciones LATAM
- Pix, OXXO, PSE, SPEI, Boleto nativos
- Flexible: fixed, usage-based, installments
- Settlement en USD
- Y Combinator backed
- Fuente: [Rebill Pricing](https://www.rebill.com/en/pricing)

**Desventajas:**

- Mínimo $500/mes para cross-border
- Menos conocido que Stripe/dLocal
- Brasil caro en tarjetas (5.5%)

**Cuándo usar Rebill:**

- Si tu modelo es 100% suscripciones
- Si necesitas métodos locales + suscripciones
- Volumen > $6K-12K/mes (para cubrir mínimo)

---

### EBANX - Enterprise (precios ocultos)

**Comisiones reportadas:** ~2.7% + $0.30 + $200/mes fee (según reviews)

**Países:** Brasil, México, Argentina, Colombia, Chile, Perú, Ecuador, Bolivia

**Métodos:**

- Brasil: Pix, Boleto, tarjetas, cuotas
- México: OXXO, SPEI, tarjetas
- Argentina: tarjetas locales
- Colombia: PSE, tarjetas

**Ventajas:**

- Usado por monday.com, Spotify, AirBnB
- Fuerte en Brasil (Pix, Boleto, cuotas)
- Account Updater (actualiza tarjetas expiradas)
- Integración con Recurly, Spreedly
- Fuente: [EBANX Recurring](https://www.ebanx.com/en/pay-in/recurring-payments/)

**Desventajas (según reviews):**

- Precios NO públicos (contactar sales)
- Fee mensual adicional (~$200 USD reportado)
- Soporte criticado: 50%+ quejas sin responder en Reclame Aqui
- API compleja, poca documentación
- "Not Recommended" en Reclame Aqui (Brasil)
- Fuente: [EBANX Reviews G2](https://www.g2.com/products/ebanx/reviews)

**Cuándo usar EBANX:**

- Ya tienes volumen enterprise
- Brasil es tu mercado principal
- Necesitas cuotas + Boleto
- Puedes negociar pricing custom

**Cuándo NO usar:**

- MVP o startup early stage
- Necesitas soporte técnico rápido
- Presupuesto limitado

---

### Yuno - ORQUESTADOR (Alternativa Enterprise)

**Qué es:** Orquestador de pagos, NO un procesador directo. Se conecta a múltiples gateways (Stripe, MercadoPago, PayU, dLocal) y enruta inteligentemente.

**Ventajas:**

- Un solo SDK para todos los proveedores
- Smart routing para maximizar aprobación
- Failover automático entre proveedores
- Clientes: McDonald's, Rappi, Uber, inDrive

**Limitaciones:**

- Suscripciones **solo con tarjetas** (no OXXO, PSE, Pix)
- Precios custom (contactar ventas)
- Overhead de complejidad para MVP
- Fuente: [Yuno Docs](https://docs.y.uno/docs/subscriptions)

**Recomendación:** Evaluar Yuno en **Fase 3 (Enterprise)** cuando el volumen justifique la optimización de routing. Para MVP, conexión directa a Stripe + MercadoPago es más simple.

---

## Casos de Uso SaaS en LATAM

### monday.com (vía EBANX)

- **Resultado:** +41% crecimiento anual en TPV
- **Ticket promedio Brasil:** $9,000 USD
- **Mix de pagos Brasil:**
  - 52% Boleto/efectivo
  - 35% Tarjetas en cuotas
  - Resto: Pix
- Fuente: [EBANX LATAM SaaS Champions](https://insights.ebanx.com/en/latam-saas-champions/)

### Métricas de conversión por método

| Método         | País      | Uplift vs tarjetas               |
| -------------- | --------- | -------------------------------- |
| MercadoPago    | Argentina | +11% conversión                  |
| NuPay          | Brasil    | +13% conversión                  |
| Pix Automático | Brasil    | Esperado alto para suscripciones |

### Best Practices SaaS LATAM

1. **Cobrar en días de pago:**
   - Brasil: 30 del mes - 5 del siguiente
   - Colombia: 15 y 30 del mes
2. **Ofrecer cuotas:** Plan anual pagado en 12 cuotas mejora conversión
3. **Habilitar débito:** Crítico para alcanzar audiencia masiva
4. **Localizar checkout:** No solo tarjetas, incluir Pix/OXXO/PSE
5. **Reintentos inteligentes:** Configurar retries automáticos

### Qué usan SaaS conocidos

| SaaS       | Proveedor LATAM    |
| ---------- | ------------------ |
| monday.com | EBANX              |
| Rappi      | Yuno (orquestador) |
| Uber       | Yuno               |
| McDonald's | Yuno               |
| Hotmart    | Propio + dLocal    |

---

## Mercado SaaS LATAM (proyección)

| Año  | Tamaño mercado        |
| ---- | --------------------- |
| 2023 | $22B USD              |
| 2027 | $46B USD (proyectado) |

- Brasil lidera crecimiento
- Pix = 61% del revenue SaaS en Brasil
- Pix Automático (junio 2025) es game changer para suscripciones
- Fuente: [EBANX Report](https://www.prnewswire.com/news-releases/latin-americas-saas-sector-is-accelerating-toward-doubling-by-2027-reveals-ebanx-302532901.html)
