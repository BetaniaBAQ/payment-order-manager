# TASK-4.documents: Payment Order Documents with Required Fields

## Summary

All documents must be linked to a tag's fileRequirement. No generic uploads. Block submission until required fields uploaded.

## Flow

1. User creates order (with tag) → navigates to detail page
2. Detail page shows ALL upload fields from tag's `fileRequirements` (required + optional)
3. User uploads documents for each field
4. Submit button disabled until all `required: true` fields have uploads
5. Optional fields shown but not mandatory for submission

## Schema Changes

### `convex/schema/documents.ts`

Add `requirementLabel` (required, not optional):

```typescript
paymentOrderDocuments = {
  // existing fields...
  requirementLabel: v.string(), // matches tag.fileRequirements[].label
}
```

## Backend Changes

### `convex/paymentOrderDocuments.ts`

Update `create` mutation:

- Add required `requirementLabel` arg
- Validate label exists in tag's fileRequirements
- Validate file type matches requirement's allowedMimeTypes

Add `checkRequiredUploads` query:

- Given paymentOrderId, return { complete: boolean, missing: string[] }
- Compares uploaded docs (by requirementLabel) vs tag's required fileRequirements

### `convex/paymentOrders.ts`

Update `updateStatus` mutation:

- CREATED → IN_REVIEW only: check required uploads, throw if missing
- NEEDS_SUPPORT → IN_REVIEW: no upload check (optional resubmission)

## Frontend Changes

### `src/components/payment-orders/create-order-dialog.tsx`

After successful creation, navigate to order detail page.

### `src/components/payment-orders/requirement-upload-field.tsx` (new)

Single upload field for one fileRequirement:

- Show label + description + required badge
- If document exists: show file info with delete option
- Else: show FileUploader filtered by allowedMimeTypes
- Validate maxFileSizeMB if set

### `src/routes/.../orders/$orderId.tsx`

- Show upload fields for each tag.fileRequirements
- No generic upload section
- Pass `canSubmit` to OrderActions based on required uploads check

## Permission Rules

| Action | Who Can Perform                                     |
| ------ | --------------------------------------------------- |
| Upload | Order creator OR org admin/owner                    |
| View   | Anyone with order access                            |
| Delete | Uploader OR org admin/owner (not in final statuses) |

Final statuses (no delete): REJECTED, RECONCILED, CANCELLED

## GDPR Compliance

Delete action deletes from UploadThing storage immediately.

## Files Modified

- `convex/schema/documents.ts` - Add requirementLabel (required)
- `convex/paymentOrderDocuments.ts` - Require requirementLabel, add checkRequiredUploads
- `convex/paymentOrders.ts` - Validate required uploads on submission
- `src/components/payment-orders/create-order-dialog.tsx` - Navigate to detail
- `src/components/payment-orders/requirement-upload-field.tsx` - New component
- `src/components/payment-orders/file-uploader.tsx` - Add accept/maxSize props
- `src/routes/.../orders/$orderId.tsx` - Show upload fields per requirement

## Verification

1. Create order with tag → redirected to detail page
2. Detail shows ALL upload fields (required + optional) from tag
3. Initial submit (CREATED → IN_REVIEW) blocked until required fields uploaded
4. Resubmit (NEEDS_SUPPORT → IN_REVIEW) allowed without new uploads
5. Optional fields visible but not blocking submission
6. Cannot upload files outside of tag's fileRequirements
7. File type validation per requirement's allowedMimeTypes
