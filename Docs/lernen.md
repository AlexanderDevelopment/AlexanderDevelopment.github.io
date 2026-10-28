# AAAK:LERNEN-BAYERN-20261028

AUTH|TL-option1/existing-site/browser-local-progress;German-question+italic-RU-or-EN-translation/aligned-bold-vocabulary;300general+10Bayern;independent-RU-or-EN-interface.
STATUS|COMPLETE/SOURCE_CONTROLLED_LOCAL_BROWSER_AND_PRODUCTION_VERIFIED|SOURCE_BASE:df79e1c029631b22bb1b7c86466ad448a5c9f6f7|SOURCE_COMMIT:4fa15d435d0bae124b15136149ef040d796ab4c1.
ROUTE|https://zweibier-indie.de/lernen/|HOST:existing-GitHub-Pages/main|DISCOVERY:direct-link/no-homepage-navigation-change/noindex-nofollow-noarchive-is-not-authentication.

## AAAK:DATA

SOURCE|BAMF-official-online-Bayern-catalogue/verified2026-10-28/all310-answer-orders+correct-indices;official-PDF-2025-05-07/question-text-with-PDF-extraction-spacing-repaired;online-text-stems-override-PDF-where-present.
SOURCE_URL|https://oet.bamf.de/ords/oetut/f?p=534:1::::::
PDF_URL|https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/gesamtfragenkatalog-lebenindeutschland.pdf?__blob=publicationFile&v=22
RECORD|scripts/lernen/catalog-de.json/310records/IDs1..300general+301..310Bayern;original-BAMF-question-ID+PDF-page+answer-order+correct-index-retained.
PROVENANCE|scripts/lernen/provenance.json/PDF-SHA256+source-date+13-original-illustration-URLs-and-SHA256;learning-translations-assistant-authored/not-official-BAMF-translations;no-claim-certified-human-translation.
ART|lernen/assets/question-{ID}.png/original-BAMF-bytes/not-generated;captions-preserve-authored-photo-credit;full-size-click-through;all-existing-art-unmodified.
TEXT|German-question-top/RU-or-EN-translation-below;two-logical-lines/wrap-responsively;translation-italic;bold-matching-vocabulary-marked-per-question;short-stems-without-complex-vocabulary-emphasize-key-subject;selectable-answers-original-German-only;correct-answer-feedback-translated-after-choice/see-feedback-contract-below.
BUILD|node scripts/lernen/build-data.mjs -> lernen/questions.json+lernen/answer-translations.json;question-translations.tsv/310rows+620translations;answer-translations.tsv/310rows+620translations;reject-missing-bold-term-or-unbalanced-markup;safe-text-node-renderer/no-user-HTML.
UPDATE|refresh-owning-BAMF-sources+all-correct-indices+affected-translations+illustrations+provenance;rerun-build+tests;change-dataset-version-if-content-or-ID-contract-changes;old-session-kept-unmodified-on-version-mismatch-until-explicit-reset.

## AAAK:QUEUE

INITIAL|learning-queue/orderedIDs1..310/no-randomization/no-filter;separate-exam-mode-see-below.
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

## AAAK:TRANSLATED-ANSWER-FEEDBACK-20261028

AUTH|TL-option1/correct-answer-in-result-block-after-wrong-and-right-choice/German-first+italic-RU-or-EN-second+aligned-bold-vocabulary;all310-complete=>offer-mock-exam.
STATUS|IMPLEMENTED/LOCAL-DATA-TESTS+FULL-COURSE-BROWSER-PASS/PRODUCTION-PENDING|SOURCE_BASE:b3a4684.
SOURCE|scripts/lernen/answer-translations.tsv/310rows/id+German-emphasis-term+RU+EN;assistant-authored-learning-translations/not-official-or-certified;answer-meaning-reviewed-in-question-context;numeric-image-options-retain-numbers.
GENERATE|catalog-de.json/correct-index+original-answer-text->build-data.mjs->answer-translations.json/versionbamf-by-answer-feedback-v1/catalogueVersionbamf-by-2026-10-28-v1/310records/de+ru+en.
RUNTIME|app.mjs/parallel-local-catalogue+feedback-fetch/cached-id-Map;validate310uniqueIDs+catalogueVersion+exact-German-answer-equality-before-restoring-session;no-online-translation-service;no-answer-translation-displayed-before-choice.
FEEDBACK|wrong=>existing-wrong-title+correct-answer-label+German-answer+italic-translated-answer+retry-detail;right=>existing-Richtig-title+German-answer+italic-translated-answer+mastered-detail;matching-vocabulary-bold-on-both-lines;single-language-selection-reused-from-question;UI-language-independent;reload-existing-pending-feedback-gains-translation-without-extra-attempt.
COMPLETE|after-final-correct-answer-and-Next=>310of310+stats+localized-mock-exam-invitation+primary-link-exam.html;repeat-course-secondary-button-retains-existing-reset-confirmation;focus-completion-heading;exam-start-remains-explicit-on-exam-setup/no-automatic-timer-start.
COMPATIBILITY|questions.json-content-and-version-byte-unchanged;learning-engine+queue-contract+storage-schema-unchanged;separate-feedback-dictionary-does-not-invalidate-learning-progress-or-exam-history;exam-mode-runtime-unmodified/no-new-answer-translations-in-exam.
QA|node --test scripts/lernen/test.mjs scripts/lernen/exam.test.mjs/22PASS;all310bindings/620translations/930balanced-feedback-lines;negation+numbers+image-answer-keys+regional-title-spotchecks;existing-learning-and-exam-regressions-PASS;app-and-builder-syntax-PASS.
BROWSER|existing-saved-correct-feedback-restored-with-translation/no-extra-attempt;wrong-answer-RU-feedback+reload-keeps2attempts1mistake;EN-translation-switch;German+translation-strong+computed-italic;full-course-via-DOM-buttons/310mastered311attempts1mistake0remaining/including-returned-question2;all-correct-feedback-translations-present;completion-heading-focused+RU-and-EN-exam-invitation;completion-link->exam.html+3previous-exam-history-records-preserved;zero-console-errors-or-warnings;automation-resumed-after-image-layout-click-failure-and-tool-timeout/no-state-injection.

## AAAK:LID-EXAM-20261028

AUTH|TL-option3/history+current-versus-previous-result;TL-refinement/with-or-without-question-translation/Leben-in-Deutschland.
STATUS|COMPLETE/LOCAL-ENGINE-AND-BROWSER+PRODUCTION-PASS|SOURCE_BASE:4e33ef4|SOURCE_COMMIT:b17c4cfdafa08901d7b3c55a5f9c79e5478f1055.
ROUTE|/lernen/index.html/localized-exam-entry->/lernen/exam.html;existing-GitHub-Pages/main.
OWNER|exam.html+exam.css+exam.mjs/presentation+storage;exam-engine.mjs/pure-attempt-state+selection+deadline+grading.
FORMAT|33unique-questions/30-of-300-Deutschland+3-of-10-Bayern/Fisher-Yates-random-without-replacement/general-first-regional-last/original-answer-order+illustrations;new-paper-each-start.
RULES|60minutes/4options/one-selected-answer;Leben-in-Deutschland-pass>=15-of33;blank-or-wrong=0points;one-correct=1point;actual-official-papers-not-published/independent-simulation-not-official-exam.
RULE_SOURCE|https://www.gesetze-im-internet.de/inttestv/__10.html
FORMAT_SOURCE|https://www.gesetze-im-internet.de/einbtestv/__1.html
FORMAT_SAMPLE|https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/musterbogen_lebenindeutschland.pdf?__blob=publicationFile&v=7
MODE|none=plain-German/no-translation/no-learning-bold;ru-or-en=German-bold-vocabulary+italic-translated-question-with-bold-vocabulary;answers-always-original-German;assisted-attempt-labelled-study-mode.
LANGUAGE|UI-RU-or-EN-independent-of-question-translation;exam-translation-fixed-at-start;reuse-existing-settings-key/zb-lernen-bayern-settings-v1;no-question-data-or-answer-key-changes.
FLOW|setup-explicit-start->active-card+33question-navigation->submit-confirmation/automatic-timeout->results+all33-review+history;answers-changeable/clearable/skippable-before-submission;no-immediate-correctness-or-score;history-hidden-while-active.
TIMER|absolute-start+3600000ms/deadline-persisted;tick1s+focus+visibility+pre-action-check;no-pause/reload-reuses-deadline;closed-or-suspended-page-finalizes-at-deadline-on-next-load-or-callback;no-action-accepted-at-or-after-deadline;elapsed-capped60min;client-clock/not-proctored-or-cheat-proof.
COMPARISON|current-completed-attempt-versus-immediately-previous-completed-attempt/all-modes;show-score-out-of33+date+mode+signed-score-delta;different-mode-note;first-attempt-no-baseline;history-review-compares-each-selected-attempt-to-its-predecessor.
HISTORY|newest-first/completed-attempts+questionIDs+answers+translation+timestamps+end-reason;score-derived-from-versioned-catalogue;manual-submission-and-timeout-share-finalization/duplicate-ID-never-appended-again.
PERSISTENCE|localStorage/zb-lernen-bayern-exams-v1/schema1/catalogue-version+revision+current+history/single-envelope-write;save-each-answer+navigation+submission;validate33partition+choices+timestamps+current-history-consistency-before-restore.
FAILURE|blocked-or-full-storage=>visible-warning+in-memory;invalid-or-old-history=>preserve-raw+visible-warning+in-memory/no-silent-overwrite;catalogue-load-error=>retry.
MULTITAB|storage-event-validates-and-adopts;pre-action-read-defers-stale-input;external-update-closes-stale-submit-dialog;localStorage-not-transactional/no-guarantee-for-truly-simultaneous-writes.
ISOLATION|exam-module-never-reads-or-writes-learning-session-key;learning-queue+pending-feedback-retained;shared-preferences-only;no-server/no-auth/no-device-sync/no-analytics/new-external-runtime-requests.
QA_ENGINE|node --test scripts/lernen/test.mjs scripts/lernen/exam.test.mjs/20PASS;240random-papers-all-modes;LiD0/14/15/16/17/33-boundaries;absolute-expiry+background-reload+late-input-rejection;answer-change-clear+history-roundtrip+duplicate-submission+corrupt-records;existing11learning-data-and-queue-tests-pass.
QA_BROWSER|local-Chromium/IAB/desktop+390x844;entry-button;none/no-bold-no-translation;RU-translation+EN-interface;EN-translation+RU-interface;italic+paired-bold;answer-change-clear+regional-jump+reload-continuing-timer;cancel-and-confirm-submit-with31blanks;complete33-answer-traversal;2/33->8/33/+6+different-mode-note;33review-items;history-reload+thirdattempt;two-tabs-sync-close-stale-dialog+single-history-record;learning-progress1/310+pending-correct-feedback-preserved;zero-console-errors-or-warnings;mobile-no-horizontal-overflow.
PROOF_BOUNDARY|one-hour-real-wall-clock-expiry-not-waited-in-browser/pure-engine-controlled-time-verified;no-claim-official-exam-certification-or-device-sync;actual-original-exam-papers-unavailable.
LIVE|GitHub-Pages-run40778471200/success/sourceb17c4cf;HTTP200/exam.html+exam.mjs+exam-engine.mjs+exam.css/content-identical-to-local-source-after-line-ending-normalization/correct-MIME;production-browser-new-entry->setup+both-modes+15of33+60min+empty-history/zero-console-errors;no-production-attempt-started;live-screenshot-in-task-artifacts.

## AAAK:LEARNING-BASELINE-ACCEPTANCE

BEFORE|existing-static-site+pitch-docs+README+deployment-source-reviewed;no-MemPalace-in-website-repository;homepage+pitch+Supabase+contact-form+Cloudflare-log-portal-have-no-imports-or-routes-into-new-app.
MAP|[DependencyMap](DependencyMap.md#lernen-bayern)/new-isolated-static-route+data-build+queue+browser-storage+QA-boundaries.
CHECK|node --test scripts/lernen/test.mjs;node --check lernen/app.mjs;node --check lernen/engine.mjs;git diff --check.
AUTOMATED|11checks/310records+620translations+German-preservation+13imagehashes+current-key-spotchecks+exact20percent+rounding+repeated-last-question+516answer-mixed-run+reload-feedback+corrupt-state+stale-action-guards.
BROWSER|local-desktop+390px-mobile;wrong-first-question=>62-successful-other-answers=>question1-returns/62mastered+63attempts+1mistake;RU/EN-independent-selection;reload-retains-error+language;correct-answer-removes-question;original-coat-of-arms-rendered;reset-cancel-keeps62/reset-confirm-restores310;no-horizontal-overflow;German+translation-strong-elements+italic-computed-style;console0warnings0errors.
ART_QA|all13original-illustrations-reviewed-in-contact-sheet;German-question+diagram-labels-preserved;Bayern-coat2+map4-match-official-answer-key.
BOUND|complete310-question-run+last-question-retries-verified-in-engine-tests/not-a-full310-browser-click-through;translations-authored-and-reviewed/not-certified.
DEPLOY|GitHub-Pages-run40758832295/completed-success/head4fa15d435d0bae124b15136149ef040d796ab4c1;https://zweibier-indie.de/lernen/.
LIVE_QA|HTTP200/index+app.mjs+engine.mjs+styles.css+questions.json+Bayern-coat-and-map;MIME-text/javascript-for-both-modules;catalogue310/Bayern10/RU310/EN310/versionbamf-by-2026-10-28-v1;production-browser-question1+fouranswers+RU-translation+zero-console-errors;fresh0/310-ready;full-page-screenshot-retained-in-task-artifacts.
KEEP|homepage/pitches/log-portal/game-runtime/all-existing-files-except-documentation-navigation;no-Unity-MCP/FEEL-assets/Photon/version/build.
