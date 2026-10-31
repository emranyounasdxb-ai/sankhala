# Email handoff and content improvements

31 October 2026. Backend, CRM, real jobs and public deployment remain deferred.

## Implemented

- Validated forms build a plain-text message for review. Copy details writes to the clipboard only after a click. When clipboard access fails, the message is selected for manual copying with accessible feedback.
- Prepare email draft uses an encoded mailto subject/body addressed to the confirmed public email. Users review and send in their own email app. The copy option also covers clients that cannot open or preserve long mailto drafts.
- Candidates see an explicit manual CV attachment reminder. File contents are never read into the message or uploaded. Editing inputs or replacing/removing a CV clears the previous draft. No automatic email, API submission or persistent profile storage was added.
- Services gives concrete briefing guidance for both audiences. Submit CV answers file-delivery, general-submission and interview-expectation questions using the confirmed manual recruitment workflow.
- Contact recommends calling before travelling to arrange a visit. The supplied map is preserved. The current privacy information explains optional copying and email draft preparation.
- Approved fonts/colors remain in use; the message field uses 16px text for mobile readability.

## Verification

Build, TypeScript and Biome passed. Twenty focused checks passed across Chromium desktop/Pixel emulation, Firefox desktop and WebKit desktop/iPhone emulation. They cover message contents, URL encoding, explicit copying, denied-clipboard fallback, selection/focus, stale-draft removal, CV reminders, existing validation and axe checks. Four mobile handoff checks passed again after the final message font adjustment. No form write requests were observed. Actual delivery through an installed email application was not simulated as successful submission.

Desktop light and narrow dark form layouts were inspected. Physical phone and hosted staging checks remain unavailable. The earlier [frontend pass](frontend-final-pass.md) records historical suite totals and browser limitations; this revision adds the handoff scenarios.

Three local production homepage samples used Chromium at 390×844 DPR1, cold cache, 4× CPU slowdown, 150ms latency and 1.6Mbps download. Median LCP: 1,724ms; observed CLS: 0; JavaScript response bytes: 147,807; resource transfer bytes: 268,427. Custom long-task blocking: 618ms, not Lighthouse TBT or INP. These are local lab samples, not field performance guarantees. A subsequent final change only consolidated Services content. [Raw report](performance-handoff.json).

## Pending facts and access

Approved office/team photos and company background, actual recruitment industries/roles, office days/hours and visit policy are still needed. The supplied pin is labeled ALIYAS Real Estate; a Sankhala business pin is needed to replace it. No facts or proof were invented. Real phones and a hosted preview are needed for the remaining launch checks.
