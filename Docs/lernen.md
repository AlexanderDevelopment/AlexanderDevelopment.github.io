# AAAK:LERNEN-BAYERN-20261028

AUTH|TL-option1/existing-site/browser-local-progress;German-question+italic-RU-or-EN-translation/aligned-bold-vocabulary;300general+10Bayern;independent-RU-or-EN-interface.
STATUS|IMPLEMENTED/SOURCE_CONTROLLED_AND_LOCAL_BROWSER_VERIFIED/PRODUCTION_PENDING|SOURCE_BASE:df79e1c029631b22bb1b7c86466ad448a5c9f6f7|SOURCE_COMMIT:task-commit-containing-this-record.
ROUTE|https://zweibier-indie.de/lernen/|HOST:existing-GitHub-Pages/main|DISCOVERY:direct-link/no-homepage-navigation-change/noindex-nofollow-noarchive-is-not-authentication.

## AAAK:DATA

SOURCE|BAMF-official-online-Bayern-catalogue/verified2026-10-28/all310-answer-orders+correct-indices;official-PDF-2025-05-07/question-text-with-PDF-extraction-spacing-repaired;online-text-stems-override-PDF-where-present.
SOURCE_URL|https://oet.bamf.de/ords/oetut/f?p=534:1::::::
PDF_URL|https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile&v=22
RECORD|scripts/lernen/catalog-de.json/310records/IDs1..300general+301..310Bayern;original-BAMF-question-ID+PDF-page+answer-order+correct-index-retained.
PROVENANCE|scripts/lernen/provenance.json/PDF-SHA256+source-date+13-original-illustration-URLs-and-SHA256;learning-translations-assistant-authored/not-official-BAMF-translations;no-claim-certified-human-translation.
ART|lernen/assets/question-{ID}.png/original-BAMF-bytes/not-generated;captions-preserve-authored-photo-credit;full-size-click-through;all-existing-art-unmodified.
TEXT|German-question-top/RU-or-EN-translation-below;two-logical-lines/wrap-responsively;translation-italic;bold-matching-vocabulary-marked-per-question;short-stems-without-complex-vocabulary-emphasize-key-subject;answers-original-German-only.
BUILD|node scripts/lernen/build-data.mjs -> lernen/questions.json;310unique-translation-rows/930question-language-lines/620translations;reject-missing-bold-term-or-unbalanced-markup;safe-text-node-renderer/no-user-HTML.
UPDATE|refresh-owning-BAMF-sources+all-correct-indices+affected-translations+illustrations+provenance;rerun-build+tests;change-dataset-version-if-content-or-ID-contract-changes;old-session-kept-unmodified-on-version-mismatch-until-explicit-reset.

## AAAK:QUEUE

INITIAL|orderedIDs1..310/no-randomization/no-filter/no-exam-mode.
RIGHT|remove-current-from-queue/add-once-to-mastered.
WRONG|remove-current;remaining=queue.length;delay=ceil(remaining/5);insert-at-index-delay;exactly-delay-other-questions-before-repeat-at-insertion-time;later-wrong-answers-can-change-relative-position;repeat-until-correct.
EXAMPLES|100other-questions=>20-before-repeat;309=>62;6=>2;5=>1;1=>1;0=>same-single-question-next.
FEEDBACK|answer-immediately-locks-options/reveals-correct-answer;persist-pending-feedback-before-Next;reload-replays-feedback-without-counting-again;Next-clears-pending;completion-only-queue-empty-and-feedback-dismissed.
INVARIANT|queue+mastered=all310unique-IDs;attempts=mastered+mistakes;no-duplicate-answer-or-Next;no-question-disappears-after-wrong-answer.

## AAAK:PERSISTENCE

OWNER|localStorage/zb-lernen-bayern-session-v1;preferences/zb-lernen-bayern-settings-v1;exact-origin+browser-only/no-server/no-account/no-device-sync;clearing-browser-storage-removes-progress.
STORE|queue+mastered+attempts+mistakes+pending+catalogue-version+timestamps;save-each-answer/Next/reset;language-switch-does-not-change-queue.
FAILURE|storage-blocked/quota=>in-memory-session+visible-warning;invalid-or-stale-session=>preserve-old-raw-record+warning/no-overwrite-until-explicit-reset;invalid-catalogue=>visible-retry/no-session-write.
MULTITAB|storage-event-validates-and-adopts-external-state;pre-action-read-defers-stale-action-if-other-tab-updated;localStorage-not-transactional/no-simultaneous-device-or-multitab-transaction-guarantee.
RESET|confirmation-dialog/cancel-preserves/confirm-recreates310queue;no-other-origin-storage-keys-written-or-cleared.

## AAAK:DEPENDENCIES-AND-QA

BEFORE|existing-static-site+pitch-docs+README+deployment-source-reviewed;no-MemPalace-in-website-repository;homepage+pitch+Supabase+contact-form+Cloudflare-log-portal-have-no-imports-or-routes-into-new-app.
MAP|[DependencyMap](DependencyMap.md#lernen-bayern)/new-isolated-static-route+data-build+queue+browser-storage+QA-boundaries.
CHECK|node --test scripts/lernen/test.mjs;node --check lernen/app.mjs;node --check lernen/engine.mjs;git diff --check.
AUTOMATED|11checks/310records+620translations+German-preservation+13imagehashes+current-key-spotchecks+exact20percent+rounding+repeated-last-question+516answer-mixed-run+reload-feedback+corrupt-state+stale-action-guards.
BROWSER|local-desktop+390px-mobile;wrong-first-question=>62-successful-other-answers=>question1-returns/62mastered+63attempts+1mistake;RU/EN-independent-selection;reload-retains-error+language;correct-answer-removes-question;original-coat-of-arms-rendered;reset-cancel-keeps62/reset-confirm-restores310;no-horizontal-overflow;German+translation-strong-elements+italic-computed-style;console0warnings0errors.
ART_QA|all13original-illustrations-reviewed-in-contact-sheet;German-question+diagram-labels-preserved;Bayern-coat2+map4-match-official-answer-key.
BOUND|complete310-question-run+last-question-retries-verified-in-engine-tests/not-a-full310-browser-click-through;translations-authored-and-reviewed/not-certified.
PENDING|production-HTTP-acceptance.
KEEP|homepage/pitches/log-portal/game-runtime/all-existing-files-except-documentation-navigation;no-Unity-MCP/FEEL-assets/Photon/version/build.
