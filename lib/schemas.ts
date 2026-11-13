// Zero-dependency validators mirroring the Zod API surface used by routes.
export const profileSchema = {
  safeParse(body: any) {
    const issues: { message: string }[] = [];
    const v: any = { ...(body ?? {}) };
    if (!v.fullName || String(v.fullName).length < 2) issues.push({ message: 'Full name is required' });
    if (!v.email || !/^\S+@\S+\.\S+$/.test(String(v.email))) issues.push({ message: 'Valid work email is required' });
    // title is optional — stored in profile JSON when provided
    v.title = v.title != null ? String(v.title) : '';
    v.years = Number(v.years ?? 0);
    if (!['citizen', 'settled', 'visa', 'sponsorship-required'].includes(v.workAuth)) v.workAuth = 'citizen';
    // Consent flags must be boolean true. Anything else fails validation.
    for (const k of ['backgroundConsent', 'referenceConsent', 'retentionConsent']) {
      v[k] = v[k] === true || v[k] === 'on';
    }
    if (issues.length) return { success: false as const, error: { issues } };
    return { success: true as const, data: v };
  },
};
export const docsSchema = {
  safeParse(body: any) {
    if (!body?.resumeName) return { success: false as const, error: { issues: [{ message: 'Upload your CV / resume' }] } };
    return { success: true as const, data: body };
  },
};
export const complianceSchema = {
  safeParse(body: any) {
    const need = ['backgroundConsent', 'referenceConsent', 'retentionConsent'].find((k) => body?.[k] !== true && body?.[k] !== 'on');
    if (need) return { success: false as const, error: { issues: [{ message: 'All compliance consents are required' }] } };
    return { success: true as const, data: body };
  },
};
export type ProfileInput = Record<string, any>;
