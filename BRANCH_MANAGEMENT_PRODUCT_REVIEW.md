# Branch Management Feature - Product Review

**Review Date:** February 4, 2026  
**Reviewer:** Product Manager  
**Focus:** Business Logic, Edge Cases, Scope, Acceptance Criteria

---

## Executive Summary

The Branch Management feature introduces a multi-tenant organizational structure to TRAC Portal. Overall, the user stories are well-structured but reveal several **critical gaps** in edge case handling, data integrity, and user experience flows. The scope is ambitious but manageable with proper clarification.

**Risk Level:** 🟡 Medium-High (due to complexity of branch-specific roles and data isolation)

---

## 1. CRITICAL GAPS (Missing Essential Functionality)

### 1.1 Branch Activation/Deactivation Workflow
**Gap:** No story covers what happens when a branch is soft-deleted or deactivated.

**Missing Scenarios:**
- Can users still access their branch dashboard if branch is inactive?
- Can inactive branches still create/manage nets?
- What happens to pending membership requests when branch is deactivated?
- Should inactive branches appear in "All Branches" filter? (US-6.2)
- Can users switch TO an inactive branch as their selected branch?

**Recommendation:** Add **US-1.6: Branch Deactivation Behavior** - Define visibility rules, access restrictions, and data handling for inactive branches.

---

### 1.2 Branch Restoration Process
**Gap:** US-1.5 mentions "Can be restored" but no story covers the restoration workflow.

**Missing Scenarios:**
- Who can restore a branch? (Only SUPER_ADMIN?)
- What happens to branch memberships when restored?
- What happens to nets associated with the branch?
- Are all relationships (members, nets, infrastructure) automatically restored?

**Recommendation:** Add **US-1.7: Branch Restoration** - Define restoration permissions, data recovery, and notification flow.

---

### 1.3 Branch Transfer/Migration
**Gap:** No mechanism to handle organizational changes.

**Missing Scenarios:**
- What if two branches merge?
- What if a branch splits into two branches?
- What if HQ needs to reassign members to different branches?
- Can nets be transferred between branches? (Conflicts with US-5.1: Branch IMMUTABLE)

**Recommendation:** Add **US-1.8: Branch Merging** (if needed) or document as out-of-scope with manual admin process.

---

### 1.4 Default Branch Selection Edge Cases
**Gap:** US-2.4 doesn't handle several scenarios.

**Missing Scenarios:**
- What if user's selected branch becomes inactive/deleted?
- What if user leaves their selected branch?
- What if user has no approved memberships (only PENDING)?
- What should be the default selection on first login?
- Should there be a fallback to HQ if no other branch available?

**Recommendation:** Enhance **US-2.4** with:
- Auto-fallback logic when selected branch becomes unavailable
- Default selection algorithm (HQ if available, else first approved branch)
- Clear error messaging when no valid branch available

---

### 1.5 Infrastructure Ownership Transfer
**Gap:** US-3.4 mentions editing/deleting but not transfer.

**Missing Scenarios:**
- Can infrastructure be transferred to another branch?
- What if branch admin leaves and new admin needs to take over?
- What happens to infrastructure when branch is deleted?

**Recommendation:** Add **US-3.5: Infrastructure Transfer** or clarify that infrastructure is deleted with branch (if that's the intent).

---

### 1.6 Membership Request Expiration
**Gap:** No time-based rules for pending requests.

**Missing Scenarios:**
- Do pending requests expire after X days?
- Should admins be notified of old pending requests?
- Can users cancel their own pending requests?
- What if user requests same branch multiple times?

**Recommendation:** Add **US-4.10: Request Lifecycle Management** - Define expiration, cancellation, and duplicate request handling.

---

### 1.7 Last Admin Protection
**Gap:** US-4.6 mentions "Cannot remove self if last admin" but doesn't cover other scenarios.

**Missing Scenarios:**
- What if last admin leaves the organization?
- Can SUPER_ADMIN assign a new admin if branch has no admins?
- What if last admin's account is deleted/banned?
- Can last admin demote themselves to MEMBER? (Should be blocked)

**Recommendation:** Enhance **US-4.6** with:
- SUPER_ADMIN override capability for emergency admin assignment
- Prevent last admin from demoting themselves
- Add **US-4.11: Emergency Admin Assignment** for SUPER_ADMIN

---

### 1.8 Net-Branch Relationship After Branch Deletion
**Gap:** US-5.1 says branch is IMMUTABLE, but what if branch is deleted?

**Missing Scenarios:**
- Can nets exist without an active branch?
- Should nets be archived/deleted when branch is deleted?
- Can nets be viewed/historical data accessed after branch deletion?
- What about statistics - should they still count toward branch stats?

**Recommendation:** Add **US-5.5: Net Handling on Branch Deletion** - Define archival, access, and data retention policies.

---

### 1.9 Password Reset Multi-Branch Scenario
**Gap:** US-4.9 says "ANY branch admin" but doesn't specify behavior.

**Missing Scenarios:**
- What if user is member of 5 branches - which admin's action takes precedence?
- Should all branch admins be notified when password is reset?
- Can multiple admins reset password simultaneously?
- Does reset affect user's access to all branches or just one?

**Recommendation:** Clarify **US-4.9** - Password reset is global (affects all branches), but any branch admin can initiate it. Add notification to other branch admins.

---

### 1.10 Statistics Aggregation Boundaries
**Gap:** US-8.1 and US-8.2 don't define calculation rules clearly.

**Missing Scenarios:**
- If user participates in Net A (Branch X) but selected branch is Y, which stats count?
- Should "All My Branches" filter aggregate stats or show separate?
- How are cross-branch statistics calculated?
- What about historical stats if user changes selected branch?

**Recommendation:** Clarify **US-8.1/US-8.2**:
- Personal stats = user's participation regardless of selected branch
- Community stats = selected branch's aggregated data
- Add examples in acceptance criteria

---

## 2. EDGE CASES NOT COVERED

### 2.1 Registration Edge Cases
- **User registers but all selected branches reject them** → User stuck as GUEST forever?
- **User selects branch that gets deleted before approval** → What happens to PENDING request?
- **User selects same branch twice during registration** → Duplicate PENDING memberships?

### 2.2 Branch Creation Edge Cases
- **SUPER_ADMIN creates branch with duplicate callsign** → Should be caught, but what's the UX?
- **SUPER_ADMIN creates branch but immediately deletes it** → Any cleanup needed?
- **Branch created with invalid contact info** → Validation rules?

### 2.3 Membership Edge Cases
- **User approved to Branch A, then immediately requests Branch B** → Can they request before HQ auto-add completes?
- **User removed from branch but has active nets as operator** → US-4.7 says "cannot remove if active nets" - does this apply to operators too?
- **SUPER_ADMIN tries to remove themselves from HQ** → Should be blocked (US-2.2 says cannot leave HQ)

### 2.4 Net Creation Edge Cases
- **User creates net, then gets removed from branch** → Can they still manage the net? (US-5.2 says "only approved branch members")
- **Net created with infrastructure, then infrastructure deleted** → Net becomes invalid?
- **Net created, then branch becomes inactive** → Can net still run?

### 2.5 Infrastructure Edge Cases
- **Infrastructure used in completed net (not active)** → Can it be deleted? (US-3.4 says "active net")
- **Multiple nets use same infrastructure** → All must be completed before deletion?
- **Infrastructure deleted while net is running** → What happens to active net?

### 2.6 SUPER_ADMIN Edge Cases
- **SUPER_ADMIN appears in member lists** → US-2.3 says "only for selected branch + HQ" - what if SUPER_ADMIN selects Branch X, are they visible in Branch Y's list?
- **SUPER_ADMIN creates branch** → Are they automatically ADMIN of that branch?
- **SUPER_ADMIN removes last admin from branch** → Who manages the branch?

---

## 3. BUSINESS RULE CONFLICTS

### 3.1 Conflict: Branch Immutability vs. Organizational Changes
**Issue:** US-5.1 states branch is IMMUTABLE after net creation, but US-1.5 allows branch deletion.

**Conflict:** If branch is deleted, what happens to nets? The immutability rule suggests nets should persist, but there's no branch to associate them with.

**Resolution Needed:** Define net lifecycle when branch is deleted (archive, reassign to HQ, or delete).

---

### 3.2 Conflict: HQ Auto-Membership vs. User Removal
**Issue:** US-2.2 says users cannot leave HQ, but US-4.7 says "Cannot remove from HQ."

**Clarification Needed:** 
- Can SUPER_ADMIN remove users from HQ? (Should be blocked)
- What if user account is deleted/banned - should they be removed from HQ?
- Is HQ membership truly permanent or just "user cannot self-remove"?

---

### 3.3 Conflict: SUPER_ADMIN Visibility vs. Branch Selection
**Issue:** US-2.3 says SUPER_ADMIN appears "only for selected branch + HQ" but US-2.3 also says they're "auto-member of all branches."

**Clarification Needed:**
- If SUPER_ADMIN selects Branch X, are they visible in Branch Y's member list? (Should be NO based on "only for selected branch + HQ")
- But if they're "auto-member of all branches," shouldn't they appear everywhere?
- This seems contradictory - needs clarification.

---

### 3.4 Conflict: Guest Participation vs. Branch Membership
**Issue:** Key rules say "GUEST can participate in nets but cannot manage" but US-5.2 says "only approved branch members can manage."

**Clarification Needed:**
- Can GUEST participate in nets if they're not approved members of the branch?
- If GUEST is PENDING in Branch X, can they participate in Branch X's nets?
- The rule suggests GUEST can participate globally, but net creation requires branch selection.

---

### 3.5 Conflict: Password Reset Authority
**Issue:** US-4.9 says "ANY branch admin where user is member" but doesn't specify if this is branch-specific or global.

**Clarification Needed:**
- Is password reset a global action (affects all branches) or branch-specific?
- If global, why does it matter which branch admin does it?
- If branch-specific, what does "password reset" mean in a multi-branch context?

---

## 4. SCOPE CREEP RISKS

### 4.1 Infrastructure Guide Hardcoding (US-3.3)
**Risk:** Hardcoded tutorials will become maintenance burden.

**Concern:** 
- Each infrastructure type needs separate tutorial
- Tutorials may need updates as technology changes
- No admin interface to update tutorials without code deployment

**Recommendation:** Consider making tutorials editable by SUPER_ADMIN (stored in DB) or at least externalize to config files.

---

### 4.2 Admin Dashboard Request Limit (US-4.3)
**Risk:** "Max 3 pending requests" seems arbitrary and may not scale.

**Concern:**
- What if branch has 50 pending requests?
- "See All" link is good, but why limit to 3?
- Should this be configurable per branch or user preference?

**Recommendation:** Make limit configurable or remove limit (just show "X pending requests" with link).

---

### 4.3 Branch Selection in localStorage (US-2.4)
**Risk:** localStorage is client-side only, may cause sync issues.

**Concern:**
- What if user uses multiple devices?
- What if localStorage is cleared?
- Should this preference be stored server-side for consistency?

**Recommendation:** Consider storing preference in user profile (server-side) with localStorage as cache/fallback.

---

### 4.4 Participant Addition UX (US-7.1)
**Risk:** "Branch members listed first" is a minor UX enhancement that may not be necessary.

**Concern:**
- Adds complexity to participant selection logic
- May not significantly improve UX if branch is small
- Could be handled by better search/filter instead

**Recommendation:** Evaluate if this is truly needed or if search/filter would suffice. Consider deferring to Phase 2.

---

## 5. ACCEPTANCE CRITERIA QUALITY

### 5.1 Weak Acceptance Criteria

**US-1.1: Şube Oluşturma**
- ❌ Missing: What happens if name/callsign validation fails?
- ❌ Missing: What are the exact validation rules for contact info?
- ❌ Missing: Should there be a confirmation step?

**US-1.2: Şube Listeleme**
- ❌ Missing: What is the default sort order?
- ❌ Missing: How many branches per page?
- ❌ Missing: Search functionality?

**US-1.3: Şube Detay**
- ❌ Missing: What specific "stats" does GUEST see?
- ❌ Missing: What "infrastructure" details are shown?
- ❌ Missing: What "members/cycles" details for VOLUNTEER+?

**US-2.2: Zorunlu HQ Üyeliği**
- ❌ Missing: What if user is already in HQ? (Duplicate prevention)
- ❌ Missing: What role is assigned in HQ? (MEMBER?)
- ❌ Missing: Notification to user about HQ membership?

**US-4.4: Üyelik Onaylama**
- ❌ Missing: Can admin assign any role or only certain roles?
- ❌ Missing: What's the default role if admin doesn't specify?
- ❌ Missing: Notification to user upon approval?

**US-5.1: Çevrim Oluşturma**
- ❌ Missing: What happens if infrastructure becomes unavailable after creation?
- ❌ Missing: Validation rules for callsign format?
- ❌ Missing: Can user create net for branch they're PENDING in?

### 5.2 Testable Acceptance Criteria Examples

**Good Example (Hypothetical):**
```
Given: User is MEMBER of Branch X
When: User creates net with Branch X
Then: Net is created successfully
And: Net.branch is set to Branch X
And: Net.branch cannot be changed in future updates
And: User receives success notification
```

**Needs Improvement:**
```
US-2.4: "Updates dashboard/lists" - Too vague
Should be: "Dashboard shows stats filtered by selected branch"
And: "Net list shows only selected branch's nets"
And: "Member list (if visible) shows selected branch's members"
```

---

## 6. QUESTIONS FOR STAKEHOLDERS

### 6.1 Business Logic Questions

1. **Branch Hierarchy:** Are branches equal peers, or is there a hierarchy? (e.g., Regional branches > Local branches)

2. **Cross-Branch Participation:** Can a user participate in nets from branches they're not members of? (GUEST rule suggests yes, but needs confirmation)

3. **Statistics Ownership:** If User A (Branch X) participates in Net B (Branch Y), which branch's statistics should count this participation?

4. **HQ Purpose:** What is HQ's actual purpose? Is it:
   - Administrative oversight?
   - Default fallback branch?
   - National coordination?
   - All of the above?

5. **Branch Types:** What's the difference between "Branch" and "Representative" types? Do they have different permissions/capabilities?

### 6.2 Technical Questions

1. **Data Isolation:** Should branch data be completely isolated, or can SUPER_ADMIN see cross-branch analytics?

2. **Audit Trail:** Should all branch actions (create, edit, delete, membership changes) be logged/auditable?

3. **Notifications:** What notification system exists? Should users be notified of:
   - Membership approvals/rejections?
   - Branch status changes?
   - Admin actions affecting them?

4. **Migration Path:** How will existing users/nets be assigned to branches? Is there a migration strategy?

### 6.3 UX Questions

1. **Onboarding:** What's the first-time user experience? Do they see a branch selection screen immediately?

2. **Branch Switching:** How often will users switch branches? Is the dropdown sufficient, or do we need a dedicated branch switcher?

3. **Multi-Branch Users:** What percentage of users will belong to multiple branches? This affects UX prioritization.

---

## 7. RECOMMENDATIONS

### 7.1 Immediate Actions (Before Development)

1. ✅ **Resolve all conflicts** listed in Section 3
2. ✅ **Define edge case handling** for top 5 edge cases from Section 2
3. ✅ **Clarify acceptance criteria** for US-1.1, US-1.3, US-2.2, US-4.4, US-5.1
4. ✅ **Answer stakeholder questions** from Section 6.1

### 7.2 Phase 1 (MVP) - Must Have

- Epic 1: Basic CRUD ✅
- Epic 2: HQ and Default Branch ✅
- Epic 4: User-Branch Relationship (Core) ✅
- Epic 5: Net-Branch Association ✅

### 7.3 Phase 2 (Enhancement) - Should Have

- Epic 3: Infrastructure (Can be simplified)
- Epic 6: Advanced Filtering
- Epic 7: Participant UX (Consider deferring)
- Epic 8: Statistics (Needs clarification)

### 7.4 Defer/Simplify

- **US-3.3 (Infrastructure Guide):** Make editable or externalize
- **US-7.1 (Participant Priority):** Evaluate necessity
- **US-4.3 (Request Limit):** Make configurable or remove limit

---

## 8. RISK ASSESSMENT

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Branch deletion breaks net associations | High | High | Define net archival strategy (US-5.5) |
| Last admin removal leaves branch unmanaged | Medium | High | Add SUPER_ADMIN override (US-4.11) |
| Default branch selection confusion | Medium | Medium | Add fallback logic (US-2.4 enhancement) |
| Statistics calculation ambiguity | High | Medium | Clarify calculation rules (US-8.1/8.2) |
| Infrastructure hardcoding maintenance | Low | Low | Consider making editable (US-3.3) |

---

## 9. CONCLUSION

The Branch Management feature is **well-conceived but needs refinement** before development begins. The core functionality is sound, but **edge cases and business rule conflicts** must be resolved to prevent technical debt and user confusion.

**Priority Actions:**
1. Resolve conflicts in Section 3
2. Add missing user stories from Section 1 (especially 1.1, 1.2, 1.4, 1.6, 1.7)
3. Clarify acceptance criteria for all user stories
4. Answer stakeholder questions before finalizing scope

**Estimated Additional Work:** 3-5 additional user stories + acceptance criteria refinement for existing stories.

**Recommendation:** ✅ **Approve with Conditions** - Proceed after addressing critical gaps and conflicts.
