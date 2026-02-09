# Plan de Suscripción B2B - Payment Order Manager

## Resumen

Modelo híbrido para LATAM: **base por organización + volumen de órdenes**.

- No cobra por usuario para evitar fricción en adopción
- Plan gratuito limitado para captar leads
- 20% descuento por pago anual
- Facturación en moneda local por país

---

## Análisis de Costos de Dependencias

| Servicio        | Tier Free        | Tier Pagado     | Costo Variable                 |
| --------------- | ---------------- | --------------- | ------------------------------ |
| **Convex**      | 2M calls, 256MB  | $25/mes base    | ~$0.001/call después de límite |
| **WorkOS**      | 1M MAU           | Enterprise      | ~$0.05/MAU                     |
| **Resend**      | 3K emails/mes    | $20/mes x 50K   | ~$0.0004/email                 |
| **UploadThing** | 2GB, 100 uploads | $10/mes x 100GB | ~$0.10/GB                      |
| **Vercel**      | Limitado         | $20/mes         | Por bandwidth                  |
| **Sentry**      | 5K errors        | $26/mes         | Por volumen                    |

**Costo fijo base estimado:** ~$100-150/mes por infraestructura compartida.

---

## Métricas de Facturación

1. **Órdenes de pago procesadas/mes** - Principal driver de valor
2. **Storage usado** - Documentos subidos
3. **Emails enviados** - Notificaciones

---

## Propuesta de Tiers (3 planes)

### 🆓 Free - $0/mes

**Target:** Evaluación del producto, negocios muy pequeños

| Límite           | Valor            |
| ---------------- | ---------------- |
| Órdenes/mes      | 10               |
| Storage          | 500 MB           |
| Usuarios         | 3                |
| Organizaciones   | 1                |
| Perfiles de pago | 1                |
| Emails           | 50/mes           |
| Historial        | 3 meses          |
| Soporte          | Docs + Comunidad |

**Sin tarjeta requerida.** Upgrade sugerido al acercarse a límites.

---

### 🚀 Pro - $49 USD/mes

**Target:** PyMEs y empresas en crecimiento

| Límite           | Valor                                    |
| ---------------- | ---------------------------------------- |
| Órdenes/mes      | 200                                      |
| Storage          | 20 GB                                    |
| Usuarios         | Ilimitados                               |
| Organizaciones   | 1                                        |
| Perfiles de pago | 10                                       |
| Emails           | 2,000/mes                                |
| Historial        | 2 años                                   |
| Soporte          | Email (24h) + Chat                       |
| **Features**     | Tags, Filtros avanzados, Exportación CSV |

**Orden adicional:** $0.20 USD

---

### 🏢 Enterprise - $149 USD/mes (o custom)

**Target:** Empresas medianas/grandes, alto volumen

| Límite           | Valor                                             |
| ---------------- | ------------------------------------------------- |
| Órdenes/mes      | 1,000+ (negociable)                               |
| Storage          | 100 GB+                                           |
| Usuarios         | Ilimitados                                        |
| Organizaciones   | Ilimitadas                                        |
| Perfiles de pago | Ilimitados                                        |
| Emails           | 10,000+/mes                                       |
| Historial        | 5+ años                                           |
| Soporte          | Prioritario + Llamadas + Onboarding               |
| **Features**     | API, Webhooks, SSO, Reportes avanzados, SLA 99.9% |

**Orden adicional:** $0.10 USD
**Contratos anuales disponibles** con términos personalizados

---

## Simulación de Rentabilidad

### Escenario: 100 clientes pagos

| Tier            | Clientes | MRR        | % Mix |
| --------------- | -------- | ---------- | ----- |
| Free            | 200      | $0         | -     |
| Pro             | 80       | $3,920     | 80%   |
| Enterprise      | 20       | $2,980     | 20%   |
| **Total pagos** | **100**  | **$6,900** | -     |

**Costos estimados (con 300 usuarios totales):**

- Convex Pro: ~$50/mes
- Resend: ~$40/mes
- UploadThing: ~$20/mes
- WorkOS: ~$50/mes
- Vercel Pro: ~$20/mes
- Sentry: ~$26/mes
- **Total costos:** ~$200-250/mes

**Margen bruto:** ~96%

### Proyección ARR

| Clientes pagos | MRR     | ARR      |
| -------------- | ------- | -------- |
| 50             | $3,450  | $41,400  |
| 100            | $6,900  | $82,800  |
| 250            | $17,250 | $207,000 |
| 500            | $34,500 | $414,000 |

---

## Descuento Anual

**20% de descuento** en planes anuales (equivale a 2 meses gratis):

| Tier       | Mensual  | Anual (20% off)       | Ahorro |
| ---------- | -------- | --------------------- | ------ |
| Pro        | $49/mes  | $470/año ($39/mes)    | $118   |
| Enterprise | $149/mes | $1,430/año ($119/mes) | $358   |

---

## Precios en Moneda Local por País

Precios ajustados por PPP, facturados en moneda local:

| País         | Moneda | Pro      | Enterprise |
| ------------ | ------ | -------- | ---------- |
| 🇺🇸 USA       | USD    | $49      | $149       |
| 🇲🇽 México    | MXN    | $849     | $2,599     |
| 🇦🇷 Argentina | ARS    | $49,000  | $149,000   |
| 🇨🇴 Colombia  | COP    | $199,000 | $599,000   |
| 🇨🇱 Chile     | CLP    | $39,000  | $119,000   |
| 🇧🇷 Brasil    | BRL    | R$249    | R$749      |
| 🇵🇪 Perú      | PEN    | S/179    | S/549      |

_Precios redondeados. Actualizar trimestralmente según tipo de cambio._

---

## Decisiones Tomadas

- [x] **Plan Free:** Sí, 10 órdenes/mes para captar leads
- [x] **Descuento anual:** 20% (2 meses gratis)
- [x] **Moneda:** Local por país con proveedores regionales
