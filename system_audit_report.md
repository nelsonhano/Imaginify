# System Audit Report: Imaginify

This audit report evaluates the Imaginify codebase according to rigorous software engineering disciplines, focusing on security, code correctness, performance, and architecture.

---

## 📊 Summary of Findings

| ID | Finding Title | Severity | Category | Impact |
| :--- | :--- | :--- | :--- | :--- |
| **VULN-01** | [Public Exposure of Internal Actions via `"use server"`](#vuln-01) | 🔥 **Critical** | Security | Remote Database Privilege Escalation / Data Deletion |
| **VULN-02** | [Client-Controlled Parameters for Credit Deductions](#vuln-02) | 🔥 **Critical** | Security | Credit Spoofing / Unlimited Credit Generation |
| **VULN-03** | [Insecure Direct Object Reference (IDOR) in Image Deletion](#vuln-03) | 🔴 **High** | Security | Unauthorized Resource Deletion |
| **BUG-01** | [`creator` vs `author` Schema Field Discrepancy](#bug-01) | 🔴 **High** | Logic Bug | Application crashes on update / Empty user collections |
| **BUG-02** | [Form Field Naming Inconsistency (`aspectRation` vs `aspectRatio`)](#bug-02) | 🟡 **Medium** | UI / State Bug | Image editing fails to load default aspect ratio values |
| **BUG-03** | [Invalid React Input Debounce Instance Handling](#bug-03) | 🟡 **Medium** | Performance | Ineffective debouncing on inputs, causing multiple database updates |
| **BUG-04** | [Typo in input name `prcolorompt`](#bug-04) | 🟢 **Low** | Code Quality | Mismatched variable naming causing maintainability issues |
| **REC-01** | [Stripe Webhook Errors Return HTTP `200 OK`](#rec-01) | 🟢 **Low** | Architecture | Hard to debug webhook pipeline |
| **REC-02** | [Mongoose Serverless Connection Cache Locking](#rec-02) | 🟢 **Low** | Architecture | Database connection errors lockout subsequent API calls |
| **REC-03** | [Dead Code in Clerk Webhook Route Handler](#rec-03) | 🟢 **Low** | Code Quality | Redundant log instructions |

---

## 🔒 Security Vulnerabilities

<a id="vuln-01"></a>
### VULN-01: Public Exposure of Internal Actions via `"use server"`
- **Severity**: 🔥 **Critical**
- **Location**: [user.actions.ts](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/lib/actions/user.actions.ts)
- **Description**: 
  The file `user.actions.ts` is marked with the `"use server"` directive. In Next.js, this turns all exported functions in that file into client-callable public Server Actions (POST endpoints). This includes administrative and internal actions such as `createUser`, `updateUser`, and `deleteUser` which are meant to be triggered only by the Clerk webhook.
- **Risk**: 
  An attacker can easily inspect the client bundle, retrieve the compiled Server Action IDs, and invoke `deleteUser(any_clerk_id)` or `updateUser(any_clerk_id, ...)` directly. This allows full database manipulation, profile hijacking, and user account deletion, bypassing webhooks entirely.
- **Remediation**:
  Move internal database synchronization logic (e.g., `createUser`, `updateUser`, `deleteUser`) to a server-only service file (e.g., `src/lib/services/user.service.ts`) that does **not** have `"use server"` at the top. Import them directly inside the Clerk webhook API route handler where they cannot be exposed to the client.

---

<a id="vuln-02"></a>
### VULN-02: Client-Controlled Parameters for Credit Deductions
- **Severity**: 🔥 **Critical**
- **Location**: [user.actions.ts](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/lib/actions/user.actions.ts#L77-L93) and [TransformationForm.tsx](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/components/shared/TransformationForm.tsx#L140-L143)
- **Description**: 
  The Server Action `updateCredits(userId: string, creditFee: number)` accepts the user ID and the credit adjustment fee directly from the client.
- **Risk**: 
  Since the parameters are fully client-controlled, any user can inspect their network traffic and send a customized payload (e.g., calling `updateCredits("my-user-id", 999999)`) to generate unlimited free credits. Alternatively, they can pass another user's ID to deplete their credits.
- **Remediation**:
  1. Do not accept `userId` or `creditFee` as client arguments.
  2. Within `updateCredits`, retrieve the user ID securely on the server using Clerk's `auth()` helper.
  3. Hardcode the credit cost (e.g. `creditFee = -1`) inside the server action, or compute it strictly on the server based on the specific action type.

---

<a id="vuln-03"></a>
### VULN-03: Insecure Direct Object Reference (IDOR) in Image Deletion
- **Severity**: 🔴 **High**
- **Location**: [image.action.ts](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/lib/actions/image.action.ts#L71-L81)
- **Description**: 
  The `deleteImage(imageId: string)` Server Action deletes the requested image from the database using `Image.findByIdAndDelete(imageId)` without verifying if the user requesting the deletion is the actual creator of the image.
- **Risk**: 
  An attacker can call `deleteImage` with arbitrary image IDs to delete images belonging to other users.
- **Remediation**:
  Verify authorization on the server:
  ```typescript
  const { userId: clerkId } = auth(); // Fetch securely from Clerk session
  if (!clerkId) throw new Error("Unauthorized");

  await connectToDatabase();
  const user = await User.findOne({ clerkId });
  const image = await Image.findById(imageId);

  if (!image || image.creator.toString() !== user._id.toString()) {
      throw new Error("Unauthorized or Image Not Found");
  }

  await Image.findByIdAndDelete(imageId);
  ```

---

## 🔴 Logic Bugs & Typos

<a id="bug-01"></a>
### BUG-01: `creator` vs `author` Schema Field Discrepancy
- **Severity**: 🔴 **High**
- **Location**: [image.action.ts](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/lib/actions/image.action.ts#L51) and [image.action.ts](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/lib/actions/image.action.ts#L170-L175)
- **Description**: 
  The Mongoose model defines the user relation field as `creator` ([image.model.ts](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/lib/database/models/image.model.ts#L36)). However, inside `updateImage` and `getUserImages` actions, the codebase references `author`:
  - `imageToUpdate.author.toHexString() !== userId` (causes an application crash since `author` is `undefined`).
  - `Image.find({ author: userId })` (returns an empty list since the field does not exist).
- **Risk**: 
  - Image updates always fail with a `TypeError` when reading `toHexString` of `undefined`.
  - The profile page displays zero image manipulations completed, and lists no user collections.
- **Remediation**:
  Change all occurrences of `author` inside [image.action.ts](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/lib/actions/image.action.ts) to `creator`.

---

<a id="bug-02"></a>
### BUG-02: Form Field Naming Inconsistency (`aspectRation` vs `aspectRatio`)
- **Severity**: 🟡 **Medium**
- **Location**: [TransformationForm.tsx](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/components/shared/TransformationForm.tsx#L37)
- **Description**: 
  The schema and form fields use the naming `aspectRation` (with a trailing `n`), but `initialValues` and the database schema expect `aspectRatio` (without a trailing `n`).
- **Risk**: 
  When editing an existing image, the form field `aspectRation` is not pre-populated with the database's `aspectRatio` value, causing the aspect ratio selector to load as blank/unselected.
- **Remediation**:
  Standardize the name `aspectRatio` throughout `TransformationForm.tsx` (schema, inputs, state setters) and remove `aspectRation`.

---

<a id="bug-03"></a>
### BUG-03: Invalid React Input Debounce Instance Handling
- **Severity**: 🟡 **Medium**
- **Location**: [TransformationForm.tsx](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/components/shared/TransformationForm.tsx#L160-L173)
- **Description**: 
  The input handler creates a fresh debounced function instance on every single key stroke:
  ```typescript
  debounce(() => { ... }, 1000)();
  ```
  Since the debounce wrapper is created dynamically on every render/keystroke, the timer inside is immediately triggered and the previous keystroke's timer is never cleared.
- **Risk**: 
  There is no actual debouncing effect. If the user type a word, multiple rapid state changes trigger consecutively.
- **Remediation**:
  Memoize the debounced function using React's `useMemo` or a custom hook:
  ```typescript
  const debouncedSetTransformation = useMemo(
      () => debounce((value, type, fieldName) => {
          setNewTransformation((prevState: any) => ({
              ...prevState,
              [type]: {
                  ...prevState?.[type],
                  [fieldName === 'prompt' ? 'prompt' : 'to']: value
              }
          }));
      }, 1000),
      []
  );
  ```

---

<a id="bug-04"></a>
### BUG-04: Typo in input name `prcolorompt`
- **Severity**: 🟢 **Low**
- **Location**: [TransformationForm.tsx](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/components/shared/TransformationForm.tsx#L256)
- **Description**: 
  The object recolor field triggers `onInputChangeHandler('prcolorompt', ...)`.
- **Risk**: 
  While this functions correctly because any string other than `'prompt'` defaults to setting the `'to'` value in the configuration, the name is confusing and compromises maintainability.
- **Remediation**:
  Change `'prcolorompt'` to `'color'` or `'to'`.

---

## ⚙️ Architectural & Operations Recommendations

<a id="rec-01"></a>
### REC-01: Stripe Webhook Errors Return HTTP `200 OK`
- **Severity**: 🟢 **Low**
- **Location**: [route.ts (Stripe Webhook)](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/app/api/webhooks/stripe/route.ts#L18-L20)
- **Description**: 
  If Stripe webhook validation fails or throws an error, the handler returns:
  `NextResponse.json({ message: "Webhook error", error: err })`
  By default, `NextResponse.json` returns an HTTP `200 OK` unless configured otherwise.
- **Risk**: 
  Stripe will think the webhook was successfully delivered and parsed. This obscures configuration issues and signatures failures from Stripe dashboard logs.
- **Remediation**:
  Pass a status code option of `400` to indicate a bad request:
  ```typescript
  return NextResponse.json({ message: "Webhook error", error: err }, { status: 400 });
  ```

---

<a id="rec-02"></a>
### REC-02: Mongoose Serverless Connection Cache Locking
- **Severity**: 🟢 **Low**
- **Location**: [mongoose.ts](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/lib/database/mongoose.ts#L20-L26)
- **Description**: 
  If the database connection fails, the rejected promise is still cached in `cached.promise`. 
- **Risk**: 
  Subsequent connection attempts will immediately return the rejected connection promise without trying to reconnect to MongoDB, causing persistent application downtime.
- **Remediation**:
  Reset `cached.promise = null` inside a catch handler if the connection fails:
  ```typescript
  if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URL, {
          dbName: 'Imaginify',
          bufferCommands: false,
      }).catch((err) => {
          cached.promise = null;
          throw err;
      });
  }
  ```

---

<a id="rec-03"></a>
### REC-03: Dead Code in Clerk Webhook Route Handler
- **Severity**: 🟢 **Low**
- **Location**: [route.ts (Clerk Webhook)](file:///c:/Users/Dell/OneDrive/Desktop/nelson/NextJsProject/imagnify/src/app/api/webhooks/clerk/route.ts#L95-L98)
- **Description**: 
  Lines 95 to 98 attempt to log `userId` when `evt.type === 'user.created'`.
- **Risk**: 
  This block is entirely unreachable because line 90 already returned an HTTP response for the same condition.
- **Remediation**:
  Remove the redundant lines.
