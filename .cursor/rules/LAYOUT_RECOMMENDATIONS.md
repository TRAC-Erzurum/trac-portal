# Page Layout Consistency Recommendations

This document lists pages that need updates to match the standardized layout patterns defined in `page-layouts.mdc`.

## Priority 1: Critical Inconsistencies

### InfrastructurePage.vue
**Issue**: Filter bar uses different layout pattern
- **Current**: `flex flex-col sm:flex-row gap-4 mb-6`
- **Should be**: `flex flex-wrap items-center gap-2` (matches other list pages)
- **Impact**: Visual inconsistency with other list pages
- **Fix**: Update filter bar container to match standard pattern

**Current Code:**
```vue
<div class="flex flex-col sm:flex-row gap-4 mb-6">
```

**Should be:**
```vue
<div class="flex flex-wrap items-center gap-2">
```

**Additional Issues:**
- Missing count display before separator
- Missing separator after filters
- Wrapper should use `space-y-4` instead of direct spacing

---

## Priority 2: Minor Inconsistencies

### NetDetailPage.vue
**Status**: ✅ Mostly compliant (uses custom NetHeader component, which is acceptable)

**Notes:**
- Uses custom `NetHeader` component for complex header logic - this is acceptable
- Sections properly separated with `<Separator class="my-8" />`
- Follows detail page pattern correctly
- No changes needed

---

### BranchDetailPage.vue
**Status**: ✅ Compliant (uses custom title slot, which is documented)

**Notes:**
- Uses custom title slot with badges - documented as acceptable pattern
- Sections follow detail layout pattern
- Filter bars in sections match standard pattern
- No changes needed

---

### ProfilePage.vue
**Status**: ✅ Compliant

**Notes:**
- Follows detail layout pattern correctly
- Section headers match standard
- Filter bars in sections match standard
- No changes needed

---

### AccountPage.vue
**Status**: ✅ Compliant

**Notes:**
- Follows detail layout pattern correctly
- Section headers match standard
- Filter bars in sections match standard
- No changes needed

---

### DashboardPage.vue
**Status**: ✅ Compliant

**Notes:**
- Follows homepage layout pattern correctly
- Uses proper responsive breakpoints
- Reuses components from other pages
- No changes needed

---

## Priority 3: Verification Needed

### NetsPage.vue
**Status**: ✅ Compliant

**Verification Checklist:**
- ✅ Uses `AppLayout` with `:title` prop
- ✅ Filter bar matches standard pattern
- ✅ Has count display
- ✅ Has separator after filters
- ✅ Grid uses standard classes
- ✅ Pagination uses "Load More" pattern
- ✅ Mobile FAB present
- ✅ Wrapper uses `space-y-4`

---

### OperatorsPage.vue
**Status**: ✅ Compliant

**Verification Checklist:**
- ✅ Uses `AppLayout` with `:title` prop
- ✅ Filter bar matches standard pattern
- ✅ Has count display
- ✅ Has separator after filters
- ✅ Grid uses standard classes
- ✅ Pagination uses "Load More" pattern
- ⚠️ No mobile FAB (no create action - acceptable)
- ✅ Wrapper uses `space-y-4`

---

### BranchesPage.vue
**Status**: ✅ Compliant

**Verification Checklist:**
- ✅ Uses `AppLayout` with `:title` prop
- ✅ Filter bar matches standard pattern (includes checkbox)
- ✅ Has count display
- ✅ Has separator after filters
- ✅ Grid uses standard classes
- ✅ Pagination uses "Load More" pattern
- ✅ Mobile FAB present
- ✅ Wrapper uses `space-y-4`

---

## Summary

### Pages Requiring Updates
1. **InfrastructurePage.vue** (Priority 1)
   - Update filter bar layout
   - Add count display
   - Add separator after filters
   - Update wrapper spacing

### Pages Verified Compliant
- NetsPage.vue ✅
- NetDetailPage.vue ✅
- OperatorsPage.vue ✅
- ProfilePage.vue ✅
- BranchesPage.vue ✅
- BranchDetailPage.vue ✅
- InfrastructurePage.vue ⚠️ (needs updates)
- AccountPage.vue ✅
- DashboardPage.vue ✅

---

## Implementation Guide

### For InfrastructurePage.vue Updates

1. **Update filter bar container:**
   ```vue
   <!-- Change from -->
   <div class="flex flex-col sm:flex-row gap-4 mb-6">
   
   <!-- To -->
   <div class="flex flex-wrap items-center gap-2">
   ```

2. **Add count display:**
   ```vue
   <p v-if="!isLoading" class="text-sm text-muted-foreground">
     {{ t('infrastructure.totalCount', { count: total }) }}
   </p>
   ```

3. **Add separator:**
   ```vue
   <Separator />
   ```

4. **Update wrapper:**
   ```vue
   <!-- Change from direct content -->
   <!-- To -->
   <div class="space-y-4">
     <!-- All content -->
   </div>
   ```

5. **Update filter select widths:**
   - Ensure selects use `flex-1 sm:flex-none sm:w-[WIDTH]` pattern
   - Current widths may need adjustment

---

## Future Development Checklist

When creating new pages, verify:

- [ ] Uses correct layout pattern (List/Detail/Homepage)
- [ ] Header uses `AppLayout` with correct props
- [ ] Filter bars match standard pattern
- [ ] Grid uses standard classes
- [ ] Pagination uses "Load More" pattern
- [ ] Mobile FAB present (if create action exists)
- [ ] Wrapper uses correct spacing (`space-y-4` for list, `space-y-6` for detail)
- [ ] Sections separated with `<Separator class="my-8" />`
- [ ] Empty states follow standard pattern
- [ ] Loading skeletons match content structure
- [ ] All buttons use `variant="outline"`
- [ ] Icons use `mr-2` spacing
