# AAAK:WEBSITE-DEPENDENCY-MAP

SCOPE|task-reviewed-boundaries/not-a-full-retrospective-audit-of-existing-website.

## lernen-bayern

SYSTEM|LERNEN_BAYERN|ROUTE:/lernen/|OWNER:lernen/index.html+app.mjs+engine.mjs.
EDGE|official-BAMF-PDF+online-Bayern-answer-key->scripts/lernen/catalog-de.json+provenance.json+lernen/assets/*.png.
EDGE|catalog-de.json+translations.tsv->scripts/lernen/build-data.mjs->lernen/questions.json;catalog-de.json/correct-answers+answer-translations.tsv->build-data.mjs->lernen/answer-translations.json.
EDGE|index.html->styles.css+icon.svg+app.mjs;app.mjs->engine.mjs+questions.json+answer-translations.json;question-record.image->local-PNG.
EDGE|app.mjs->scoped-localStorage-session+settings;engine.mjs->pure-queue-contract;validated-saved-state->app-render;DOM-input->queue-transition->save->render.
EDGE|pending-feedback+question-ID+translation-setting->validated-answer-dictionary->German+italic-RU-or-EN-result-lines;queue-empty+pending-dismissed->completion-invitation->exam.html/explicit-start.
EDGE|test.mjs->engine.mjs+catalogue+provenance+PNG-SHA256;README+Docs/README->Docs/lernen.md->this-map.
EDGE|test.mjs->answer-translations.json/exact-correct-answer-binding+310translations-per-language+balanced-emphasis+negation-number-key-spotchecks.
BOUNDARY|existing-homepage+pitch-pages+contact+Supabase-key-claims+separate-Cloudflare-log-portal=>no-new-runtime-edges;shared-hosting-deploy-is-static-repository-publication-only.
LIFETIME|one-tab-module-load/cached-question-Map+DOM-handlers;no-object-discovery-loop/no-external-runtime-translation-request/no-analytics.
QA|node --test scripts/lernen/test.mjs;syntax;desktop+mobile-browser;post-push-public-route+data+asset-HTTP.
SOURCE_BASE|df79e1c029631b22bb1b7c86466ad448a5c9f6f7|SOURCE_COMMIT:4fa15d435d0bae124b15136149ef040d796ab4c1|DATE:2026-10-28.
ACCEPTANCE|11Node-tests-PASS;desktop+390px-mobile-PASS;actual62-question-retry-position-PASS;production-run40758832295-success/HTTP+browser-PASS;completion+singleton-retries-controlled-engine-verified.
FEEDBACK_CHANGE|SOURCE_BASE:b3a4684/direct+reverse-review/app-feedback+load+completion+settings+session-restore+shared-style-consumers+builder+exam-catalogue-consumer;question-catalogue-and-storage-contracts-unchanged;22tests-PASS/full310-course-browser-PASS/311attempts1mistake+translated-feedback+RU-EN-completion-link+retained-exam-history;production-pending.

## lernen-lid-exam

SYSTEM|LERNEN_LID_EXAM|ROUTE:/lernen/exam.html|OWNER:lernen/exam.html+exam.mjs+exam-engine.mjs+exam.css.
EDGE|lernen/index.html+app.mjs/localized-exam-entry->exam.html.
EDGE|exam.html->styles.css/shared-brand-and-card-primitives+exam.css/scoped-layout+exam.mjs.
EDGE|exam.mjs->exam-engine.mjs+questions.json+existing-local-PNG;exam-engine.mjs->random30general+3Bayern/absolute60min-deadline/LiD15point-threshold.
EDGE|exam.mjs->localStorage/zb-lernen-bayern-exams-v1(current+history);exam.mjs<->zb-lernen-bayern-settings-v1/shared-ui-and-translation-preferences.
EDGE|DOM-answer+navigation->validated-attempt-transition->single-envelope-save->active-render;deadline-or-submit->immutable-result->history+previous-attempt-comparison+review.
EDGE|scripts/lernen/exam.test.mjs->exam-engine.mjs+questions.json;Docs/lernen.md->exam-contract+source-rules+QA.
BOUNDARY|no-runtime-import-of-learning-engine/no-learning-session-key-access/no-learning-queue-mutation;catalogue+original-answer-order+13images-unchanged;existing-homepage+pitch-pages+log-portal-no-new-edges;shared-GitHub-Pages-publication.
LIFETIME|cached-questions+byId-Map/module-DOM-handlers;1s-timer-updates-existing-timer-node/expiry-check-only/no-network-polling;history-render-after-submission-or-navigation;localStorage-not-transactional.
REVIEW_BEFORE|4e33ef4/lernen-index+styles+copy+queue-engine+storage-handlers+data+tests+canonical-docs/direct-and-reverse-consumers-reviewed;no-MemPalace-in-website-repository.
QA_AFTER|20Node-tests-PASS+syntax+desktop-and390px-mobile+complete33-answer-browser-flow+both-translation-languages+none+history-comparison+reload+two-tab-sync+learning-progress-preserved;60min-expiry-engine-controlled-time-only;production-run40778471200-success/HTTP200+source-content-parity+browser-setup-PASS;SOURCE_COMMIT:b17c4cfdafa08901d7b3c55a5f9c79e5478f1055.
