# AAAK:WEBSITE-DEPENDENCY-MAP

SCOPE|task-reviewed-boundaries/not-a-full-retrospective-audit-of-existing-website.

## lernen-bayern

SYSTEM|LERNEN_BAYERN|ROUTE:/lernen/|OWNER:lernen/index.html+app.mjs+engine.mjs.
EDGE|official-BAMF-PDF+online-Bayern-answer-key->scripts/lernen/catalog-de.json+provenance.json+lernen/assets/*.png.
EDGE|catalog-de.json+translations.tsv->scripts/lernen/build-data.mjs->lernen/questions.json.
EDGE|index.html->styles.css+icon.svg+app.mjs;app.mjs->engine.mjs+questions.json;question-record.image->local-PNG.
EDGE|app.mjs->scoped-localStorage-session+settings;engine.mjs->pure-queue-contract;validated-saved-state->app-render;DOM-input->queue-transition->save->render.
EDGE|test.mjs->engine.mjs+catalogue+provenance+PNG-SHA256;README+Docs/README->Docs/lernen.md->this-map.
BOUNDARY|existing-homepage+pitch-pages+contact+Supabase-key-claims+separate-Cloudflare-log-portal=>no-new-runtime-edges;shared-hosting-deploy-is-static-repository-publication-only.
LIFETIME|one-tab-module-load/cached-question-Map+DOM-handlers;no-object-discovery-loop/no-external-runtime-translation-request/no-analytics.
QA|node --test scripts/lernen/test.mjs;syntax;desktop+mobile-browser;post-push-public-route+data+asset-HTTP.
SOURCE_BASE|df79e1c029631b22bb1b7c86466ad448a5c9f6f7|SOURCE_COMMIT:4fa15d435d0bae124b15136149ef040d796ab4c1|DATE:2026-10-28.
ACCEPTANCE|11Node-tests-PASS;desktop+390px-mobile-PASS;actual62-question-retry-position-PASS;production-run40758832295-success/HTTP+browser-PASS;completion+singleton-retries-controlled-engine-verified.
