/* LaunchPad — app.js | Firebase Auth (multi-user) + 9 Tracks */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── FIREBASE CONFIG ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCtPOtbes8VDiNq252bor-TeJsyU0aXzio",
  authDomain: "launchpad-3d185.firebaseapp.com",
  projectId: "launchpad-3d185",
  storageBucket: "launchpad-3d185.firebasestorage.app",
  messagingSenderId: "191830848477",
  appId: "1:191830848477:web:e249c28fbf358421e6bc34"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

let currentUser = null;
let isSignupMode = false;

function getUserDocRef() {
  if (!currentUser) return null;
  return doc(db, "users", currentUser.uid);
}

// ── STATIC DATA: SUGGESTIONS (9 tracks) ───────────────────────────────────────
const SUGGESTIONS = {
  'data-analyst': [
    { name: 'Tableau', why: 'Tableau hires DA roles frequently; great for your viz skills', url: 'https://www.salesforce.com/company/careers/' },
    { name: 'Splunk', why: 'Data analytics platform — strong DA internship program', url: 'https://www.splunk.com/en_us/careers.html' },
    { name: 'Domo', why: 'BI-focused company; loves entry-level analysts', url: 'https://www.domo.com/company/jobs' },
    { name: 'Nielsen', why: 'Data-driven media analytics; hires CS + data grads', url: 'https://www.nielsen.com/careers/' },
    { name: 'Qualtrics', why: 'Experience data platform; strong Phoenix/AZ presence', url: 'https://www.qualtrics.com/careers/' },
    { name: 'GoDaddy', why: 'HQ in Tempe AZ — local, data-heavy roles, new grad friendly', url: 'https://careers.godaddy.com' },
    { name: 'American Express', why: 'Huge DA org; great entry-level structured program', url: 'https://www.americanexpress.com/en-us/careers/' },
    { name: 'Intel', why: 'Has offices in Chandler AZ; strong data analyst pipeline', url: 'https://www.intel.com/content/www/us/en/jobs/jobs-at-intel.html' },
    { name: 'Charles Schwab', why: 'Finance giant with large DA team; strong new grad intake', url: 'https://www.schwabjobs.com' },
    { name: 'PetSmart', why: 'HQ in Phoenix AZ; growing retail analytics team', url: 'https://careers.petsmart.com' },
    { name: 'Amazon', why: 'Massive DA hiring volume across nearly every team', url: 'https://www.amazon.jobs' },
    { name: 'Wayfair', why: 'E-commerce company built on data; strong DA new grad pipeline', url: 'https://www.aboutwayfair.com/careers' },
    { name: 'Discover Financial', why: 'Fintech with structured analyst rotational programs', url: 'https://jobs.discover.com' },
    { name: 'UnitedHealth Group / Optum', why: 'Healthcare data giant; huge analyst hiring volume', url: 'https://careers.unitedhealthgroup.com' },
    { name: 'Verizon', why: 'Telecom analytics team hires consistently at entry level', url: 'https://www.verizon.com/about/careers' },
    { name: 'Albertsons', why: 'Grocery chain headquartered in Boise but strong AZ presence; growing data team', url: 'https://careers.albertsons.com' },
  ],
  'data-science': [
    { name: 'Waymo', why: 'Autonomous vehicles need strong DS; Google-backed', url: 'https://waymo.com/careers/' },
    { name: 'Duolingo', why: 'ML/DS-heavy culture; popular new grad destination', url: 'https://careers.duolingo.com' },
    { name: 'Spotify', why: 'Famous for DS work in recommendation systems', url: 'https://www.lifeatspotify.com/jobs' },
    { name: 'Stitch Fix', why: 'Algorithms company at heart; loves Python + ML', url: 'https://www.stitchfix.com/careers' },
    { name: 'Rivian', why: 'EV startup scaling fast; data roles growing rapidly', url: 'https://rivian.com/careers' },
    { name: 'Instacart', why: 'Strong DS team; grocery + logistics data is rich', url: 'https://instacart.careers' },
    { name: 'Robinhood', why: 'Fintech + data science overlap; new grad programs exist', url: 'https://careers.robinhood.com' },
    { name: 'DoorDash', why: 'Logistics optimization is core DS work here', url: 'https://careers.doordash.com' },
    { name: 'Pinterest', why: 'Recommendation systems + visual search; active DS hiring', url: 'https://www.pinterestcareers.com' },
    { name: 'Affirm', why: 'Fintech risk modeling; strong DS new grad track', url: 'https://www.affirm.com/careers' },
    { name: 'Block (Square)', why: 'Payments + fintech DS roles; structured new grad hiring', url: 'https://block.xyz/careers' },
    { name: 'Coursera', why: 'EdTech with rich learner data; DS-driven personalization', url: 'https://careers.coursera.com' },
    { name: 'NVIDIA', why: 'GPU/AI giant; huge DS and ML hiring across teams', url: 'https://www.nvidia.com/en-us/about-nvidia/careers/' },
    { name: 'Capital One', why: 'Known for structured DS rotational programs for new grads', url: 'https://www.capitalonecareers.com' },
    { name: 'Etsy', why: 'Marketplace search + recommendations; approachable DS team', url: 'https://www.etsy.com/careers' },
    { name: 'Snowflake', why: 'Data platform company; DS roles directly shape the product', url: 'https://careers.snowflake.com' },
  ],
  frontend: [
    { name: 'Figma', why: 'Design-forward company; loves devs who think about UX', url: 'https://www.figma.com/careers/' },
    { name: 'Vercel', why: 'Frontend infrastructure company; deeply JS/web focused', url: 'https://vercel.com/careers' },
    { name: 'Linear', why: 'Product quality bar is very high; great portfolio signal', url: 'https://linear.app/careers' },
    { name: 'Shopify', why: 'Massive frontend codebase; new grad programs active', url: 'https://www.shopify.com/careers' },
    { name: 'Stripe', why: 'Best-in-class frontend; competitive but worth applying', url: 'https://stripe.com/jobs' },
    { name: 'Webflow', why: 'No-code/low-code tool; frontend-first culture', url: 'https://webflow.com/careers' },
    { name: 'Notion', why: 'Rich text editor company; complex frontend engineering', url: 'https://www.notion.so/careers' },
    { name: 'Canva', why: 'Design tool with a massive, complex frontend surface', url: 'https://www.canva.com/careers/' },
    { name: 'Airtable', why: 'Spreadsheet-meets-database UI; intricate frontend work', url: 'https://airtable.com/careers' },
    { name: 'Asana', why: 'Project management tool; frontend-heavy product team', url: 'https://asana.com/jobs' },
    { name: 'Discord', why: 'Real-time UI at scale; strong frontend engineering culture', url: 'https://discord.com/careers' },
    { name: 'Framer', why: 'Design + code hybrid tool; frontend is the entire product', url: 'https://www.framer.com/careers/' },
    { name: 'Coinbase', why: 'Crypto exchange UI; high-stakes, fast-moving frontend team', url: 'https://www.coinbase.com/careers' },
    { name: 'Webex (Cisco)', why: 'Video conferencing UI; large frontend team, structured hiring', url: 'https://jobs.cisco.com' },
    { name: 'Squarespace', why: 'Website builder; frontend is core to the entire business', url: 'https://www.squarespace.com/careers' },
    { name: 'Zillow', why: 'Real estate platform; map-heavy, data-rich frontend work', url: 'https://www.zillow.com/careers/' },
  ],
  'ai-engineer': [
    { name: 'Cohere', why: 'LLM API company; loves LangChain / RAG experience', url: 'https://cohere.com/careers' },
    { name: 'Scale AI', why: 'AI data infrastructure; strong new grad AI eng hiring', url: 'https://scale.com/careers' },
    { name: 'Runway', why: 'Generative AI products; growing engineering team fast', url: 'https://runwayml.com/careers' },
    { name: 'Weights & Biases', why: 'MLOps tooling; deeply technical, portfolio-friendly', url: 'https://wandb.ai/site/careers' },
    { name: 'Pinecone', why: 'Vector DB company — your RAG project is directly relevant!', url: 'https://www.pinecone.io/careers/' },
    { name: 'LangChain', why: 'You are learning LangChain — applying here is a natural fit', url: 'https://www.langchain.com/careers' },
    { name: 'Hugging Face', why: 'Open-source AI hub; strong community, entry roles exist', url: 'https://apply.workable.com/huggingface/' },
    { name: 'Anthropic', why: 'Claude creator; hires across AI engineering roles', url: 'https://www.anthropic.com/careers' },
    { name: 'Perplexity', why: 'AI search company; RAG is literally the product', url: 'https://www.perplexity.ai/careers' },
    { name: 'Mistral AI', why: 'Open-weight LLM company; growing engineering team', url: 'https://mistral.ai/careers' },
    { name: 'Glean', why: 'Enterprise AI search; RAG + retrieval is core to the product', url: 'https://www.glean.com/careers' },
    { name: 'Adept AI', why: 'AI agents company; great fit if you like agentic workflows', url: 'https://www.adept.ai/careers' },
    { name: 'Together AI', why: 'AI infrastructure + inference; growing fast, technical bar is high', url: 'https://www.together.ai/careers' },
    { name: 'Replit', why: 'AI coding assistant company; blends AI eng + frontend', url: 'https://replit.com/careers' },
    { name: 'Sierra', why: 'AI customer service agents; applied LLM engineering roles', url: 'https://sierra.ai/careers' },
    { name: 'Writer', why: 'Enterprise generative AI platform; growing AI eng team', url: 'https://writer.com/careers/' },
  ],
  'business-analyst': [
    { name: 'Accenture', why: 'Massive BA pipeline; structured new grad rotational programs', url: 'https://www.accenture.com/us-en/careers' },
    { name: 'Deloitte', why: 'Top consulting firm; strong BA + analytics track for new grads', url: 'https://www2.deloitte.com/us/en/careers/careers.html' },
    { name: 'Capital One', why: 'Data-driven BA roles; well known for structured new grad hiring', url: 'https://www.capitalonecareers.com' },
    { name: 'IBM', why: 'Long-standing BA + consulting arm; large new grad intake', url: 'https://www.ibm.com/careers' },
    { name: 'PayPal', why: 'Fintech BA roles bridging product and data', url: 'https://careers.pypl.com' },
    { name: 'USAA', why: 'Insurance/finance BA roles; known for strong early-career programs', url: 'https://www.usaajobs.com' },
    { name: 'EY (Ernst & Young)', why: 'Big Four consulting; structured BA new grad pathway', url: 'https://www.ey.com/en_us/careers' },
    { name: 'PwC', why: 'Big Four firm with dedicated business analyst tracks', url: 'https://www.pwc.com/us/en/careers.html' },
    { name: 'KPMG', why: 'Big Four consulting; large BA hiring volume each year', url: 'https://www.kpmguscareers.com' },
    { name: 'Wells Fargo', why: 'Large bank with structured BA rotational programs', url: 'https://www.wellsfargojobs.com' },
    { name: 'JPMorgan Chase', why: 'Huge BA hiring across business lines; strong new grad program', url: 'https://careers.jpmorgan.com' },
    { name: 'Honeywell', why: 'HQ presence in AZ; industrial BA roles bridging ops and data', url: 'https://careers.honeywell.com' },
    { name: 'American Airlines', why: 'Large ops + BA team; HQ in DFW, hires broadly', url: 'https://jobs.aa.com' },
    { name: 'Cigna', why: 'Healthcare BA roles; structured entry-level analyst hiring', url: 'https://jobs.cigna.com' },
    { name: 'State Farm', why: 'Insurance BA roles; known for strong new grad programs', url: 'https://www.statefarm.com/careers' },
    { name: 'Northrop Grumman', why: 'Defense contractor with AZ presence; BA roles bridging ops/data', url: 'https://www.northropgrumman.com/careers' },
  ],
  'product-manager': [
    { name: 'Atlassian', why: 'PM-friendly culture; associate PM programs for new grads', url: 'https://www.atlassian.com/company/careers' },
    { name: 'Asana', why: 'Product-led company; great for understanding PM fundamentals', url: 'https://asana.com/jobs' },
    { name: 'Microsoft', why: 'Has a structured Program Manager rotational track for new grads', url: 'https://careers.microsoft.com' },
    { name: 'Meta', why: 'Famous Associate Product Manager (APM) program', url: 'https://www.metacareers.com' },
    { name: 'Dropbox', why: 'Mid-size, approachable PM team for early-career candidates', url: 'https://www.dropbox.com/jobs' },
    { name: 'Salesforce', why: 'Large PM org with structured new grad pathways', url: 'https://www.salesforce.com/company/careers/' },
    { name: 'Google', why: 'Famous APM (Associate Product Manager) rotational program', url: 'https://careers.google.com' },
    { name: 'Uber', why: 'Large, fast-moving PM org with new grad opportunities', url: 'https://www.uber.com/us/en/careers/' },
    { name: 'Intuit', why: 'Structured APM-style program; product-led culture', url: 'https://jobs.intuit.com' },
    { name: 'LinkedIn', why: 'Strong APM program; good for early-career PM candidates', url: 'https://careers.linkedin.com' },
    { name: 'Adobe', why: 'Large product org across Creative Cloud, Document Cloud, etc.', url: 'https://careers.adobe.com' },
    { name: 'Wealthfront', why: 'Fintech with lean PM team; good hands-on early-career exposure', url: 'https://www.wealthfront.com/careers' },
    { name: 'HubSpot', why: 'Product-led growth company; approachable entry-level PM roles', url: 'https://www.hubspot.com/careers' },
    { name: 'Box', why: 'Enterprise SaaS; structured early-career product roles', url: 'https://www.box.com/careers' },
    { name: 'monday.com', why: 'Fast-growing product-led company; lean PM team', url: 'https://monday.com/careers' },
    { name: 'Zoom', why: 'Large product org; growing PM hiring beyond core video', url: 'https://careers.zoom.us' },
  ],
  devops: [
    { name: 'HashiCorp', why: 'Infra tooling company (Terraform, Vault); DevOps-native culture', url: 'https://www.hashicorp.com/careers' },
    { name: 'Datadog', why: 'Observability platform; loves people who understand infra + ops', url: 'https://careers.datadoghq.com' },
    { name: 'PagerDuty', why: 'Incident response company; DevOps culture runs deep here', url: 'https://www.pagerduty.com/careers/' },
    { name: 'DigitalOcean', why: 'Cloud infra company; approachable for new grad DevOps roles', url: 'https://www.digitalocean.com/careers' },
    { name: 'Red Hat', why: 'Open-source infra giant; strong DevOps/SRE hiring', url: 'https://www.redhat.com/en/jobs' },
    { name: 'CloudBees', why: 'CI/CD focused; great if you like automation + pipelines', url: 'https://www.cloudbees.com/careers' },
    { name: 'GitLab', why: 'DevOps platform company; entire product is built around the practice', url: 'https://about.gitlab.com/jobs/' },
    { name: 'CircleCI', why: 'CI/CD platform; DevOps is the whole business model', url: 'https://circleci.com/careers/' },
    { name: 'New Relic', why: 'Observability + monitoring; strong DevOps-adjacent hiring', url: 'https://newrelic.com/about/careers' },
    { name: 'Fastly', why: 'Edge cloud platform; infra-heavy DevOps culture', url: 'https://www.fastly.com/about/careers' },
    { name: 'Snowflake', why: 'Cloud data platform; growing DevOps/infra team', url: 'https://careers.snowflake.com' },
    { name: 'Cloudflare', why: 'Edge network company; deep infra and DevOps hiring', url: 'https://www.cloudflare.com/careers/' },
    { name: 'Confluent', why: 'Streaming data infra (Kafka); strong DevOps culture', url: 'https://careers.confluent.io' },
    { name: 'Elastic', why: 'Search + observability platform; DevOps-adjacent roles plentiful', url: 'https://www.elastic.co/careers' },
    { name: 'Equinix', why: 'Data center company; deeply infra-focused, hires DevOps broadly', url: 'https://careers.equinix.com' },
    { name: 'VMware (Broadcom)', why: 'Virtualization giant; long-standing infra/DevOps hiring', url: 'https://careers.broadcom.com' },
  ],
  'qa-test': [
    { name: 'Tricentis', why: 'Test automation company; QA is the entire product focus', url: 'https://www.tricentis.com/careers' },
    { name: 'BrowserStack', why: 'Testing infrastructure company; QA-first culture', url: 'https://www.browserstack.com/careers' },
    { name: 'Applause', why: 'Crowdtesting platform; flexible entry point into QA', url: 'https://www.applause.com/careers' },
    { name: 'Intuit', why: 'Large QA org supporting TurboTax/QuickBooks; structured new grad hiring', url: 'https://jobs.intuit.com' },
    { name: 'EA (Electronic Arts)', why: 'Game QA is a well-known entry path into tech for new grads', url: 'https://www.ea.com/careers' },
    { name: 'Cisco', why: 'Large QA/test engineering org with new grad programs', url: 'https://jobs.cisco.com' },
    { name: 'Sauce Labs', why: 'Cloud testing platform; QA automation is the core business', url: 'https://saucelabs.com/careers' },
    { name: 'Mozilla', why: 'Open-source browser; strong QA culture given cross-platform needs', url: 'https://www.mozilla.org/en-US/careers/' },
    { name: 'Blizzard Entertainment', why: 'Game QA is a common, well-trodden entry path here', url: 'https://careers.blizzard.com' },
    { name: 'Activision', why: 'Large QA org supporting major game franchises', url: 'https://www.activision.com/careers' },
    { name: 'PayPal', why: 'Fintech QA roles; high reliability bar given payments risk', url: 'https://careers.pypl.com' },
    { name: 'GoDaddy', why: 'HQ in Tempe AZ; growing QA/test engineering team', url: 'https://careers.godaddy.com' },
    { name: 'USAA', why: 'Insurance/finance QA roles; structured early-career hiring', url: 'https://www.usaajobs.com' },
    { name: 'Charles Schwab', why: 'Finance company with rigorous QA practices given compliance needs', url: 'https://www.schwabjobs.com' },
    { name: 'Take-Two Interactive', why: 'Game publisher; QA is a known entry path into the industry', url: 'https://take2games.com/careers' },
    { name: 'ServiceNow', why: 'Enterprise SaaS; large QA/test engineering org', url: 'https://careers.servicenow.com' },
  ],
  'ux-design': [
    { name: 'Adobe', why: 'Design tooling company (XD, Figma competitor); strong UX hiring', url: 'https://careers.adobe.com' },
    { name: 'Airbnb', why: 'Famous for design-led product culture; competitive but worth it', url: 'https://careers.airbnb.com' },
    { name: 'IBM Design', why: 'Large dedicated design org; structured entry-level UX roles', url: 'https://www.ibm.com/careers' },
    { name: 'Intuit', why: 'Strong UX research + design team behind TurboTax/QuickBooks', url: 'https://jobs.intuit.com' },
    { name: 'Pinterest', why: 'Visual-first product; UX is core to the company DNA', url: 'https://www.pinterestcareers.com' },
    { name: 'Canva', why: 'Design tool company; UX roles directly shape the product', url: 'https://www.canva.com/careers/' },
    { name: 'Spotify', why: 'Strong design team behind a famously polished product', url: 'https://www.lifeatspotify.com/jobs' },
    { name: 'Duolingo', why: 'Famous for playful, research-driven UX; great culture fit signal', url: 'https://careers.duolingo.com' },
    { name: 'Headspace', why: 'Wellness app with calm, intentional UX; design-led culture', url: 'https://www.headspace.com/careers' },
    { name: 'Notion', why: 'Design-forward productivity tool; UX team shapes core workflows', url: 'https://www.notion.so/careers' },
    { name: 'Webflow', why: 'No-code design tool; UX directly impacts how users build sites', url: 'https://webflow.com/careers' },
    { name: 'Calm', why: 'Wellness app; strong emphasis on emotionally considered design', url: 'https://www.calm.com/careers' },
    { name: 'Mailchimp', why: 'Known for distinctive, friendly visual design and UX writing', url: 'https://mailchimp.com/careers/' },
    { name: 'Asana', why: 'Productivity tool; UX team focused on reducing complexity', url: 'https://asana.com/jobs' },
    { name: 'Robinhood', why: 'Fintech with a strong design-led approach to simplifying investing', url: 'https://careers.robinhood.com' },
    { name: 'Peloton', why: 'Fitness tech; UX spans hardware and software experiences', url: 'https://careers.onepeloton.com' },
  ],
};

const TRACKS = [
  { key: 'data-analyst', label: 'Data Analyst', tag: 'DA', tagClass: 'tag-da', desc: 'Analytics, BI, SQL-heavy roles' },
  { key: 'data-science', label: 'Data Science', tag: 'DS', tagClass: 'tag-ds', desc: 'ML, modeling, Python-heavy' },
  { key: 'frontend', label: 'Frontend Dev', tag: 'FE', tagClass: 'tag-fe', desc: 'React, UI/UX, web apps' },
  { key: 'ai-engineer', label: 'AI Engineering', tag: 'AI', tagClass: 'tag-ai', desc: 'LLMs, RAG, AI products' },
  { key: 'business-analyst', label: 'Business Analyst', tag: 'BA', tagClass: 'tag-ba', desc: 'Requirements, process, data-informed decisions' },
  { key: 'product-manager', label: 'Product Manager', tag: 'PM', tagClass: 'tag-pm', desc: 'Roadmaps, cross-functional leadership' },
  { key: 'devops', label: 'DevOps', tag: 'DO', tagClass: 'tag-do', desc: 'CI/CD, infra, automation' },
  { key: 'qa-test', label: 'QA / Test', tag: 'QA', tagClass: 'tag-qa', desc: 'Test automation, quality engineering' },
  { key: 'ux-design', label: 'UX Design', tag: 'UX', tagClass: 'tag-ux', desc: 'Research, prototyping, product design' },
];

const STATUS_FILTERS = ['all', 'applied', 'screening', 'interview', 'offer', 'rejected'];
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const MAX_COMPANIES = 500;
const MAX_APPLICATIONS = 500;
const genId = (prefix) => prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

// ── STATE ─────────────────────────────────────────────────────────────────────
let currentPage = 'dashboard';
let appFilter = 'all';
let selectedTrack = null;
let state = { companies: [], applications: [], deadline: '2027-01-01' };

// ── FIREBASE: PER-USER DATA ───────────────────────────────────────────────────
async function loadState() {
  const ref = getUserDocRef();
  if (!ref) return;
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      state.companies = d.companies || [];
      state.applications = d.applications || [];
      state.deadline = d.deadline || '2027-01-01';
    } else {
      state.companies = [];
      state.applications = [];
      state.deadline = '2027-01-01';
      await setDoc(ref, { companies: [], applications: [], deadline: '2027-01-01' });
    }
  } catch (err) {
    console.error('Firebase load error:', err);
    showToast('Could not load data. Check your internet.', 'error');
  }
}

async function saveState() {
  const ref = getUserDocRef();
  if (!ref) return;
  try {
    await setDoc(ref, {
      companies: state.companies,
      applications: state.applications,
      deadline: state.deadline,
    }, { merge: true });
  } catch (err) {
    console.error('Firebase save error:', err);
    showToast('Could not save. Check your internet.', 'error');
  }
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast${type === 'error' ? ' toast-error' : ''}`;
  t.classList.remove('hidden');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add('hidden'), 3000);
}

// ── LOADING ───────────────────────────────────────────────────────────────────
function showLoading() { document.getElementById('loading-overlay').classList.remove('hidden'); }
function hideLoading() { document.getElementById('loading-overlay').classList.add('hidden'); }

// ── UTILS ─────────────────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function safeUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return (u.protocol === 'https:' || u.protocol === 'http:') ? url : '';
  } catch { return ''; }
}
// sanitizeUrl is called before saving — rejects non-http(s) and returns '' for invalid input
function sanitizeUrl(url) {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  return safeUrl(trimmed);
}
function formatDate(s) {
  if (!s) return '';
  return new Date(s + (s.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function todayISO() { return new Date().toISOString().slice(0, 10); }

// ── DEADLINE ──────────────────────────────────────────────────────────────────
function updateDeadlineWidget() {
  const deadline = new Date(state.deadline + 'T00:00:00');
  const start = new Date('2024-09-01T00:00:00');
  const now = new Date();
  const pct = Math.min(100, Math.max(0, ((now - start) / (deadline - start)) * 100));
  const daysLeft = Math.ceil((deadline - now) / 86400000);
  const elDate = document.getElementById('deadline-date');
  const elDays = document.getElementById('deadline-days');
  const elBar = document.getElementById('deadline-bar');
  if (elDate) elDate.textContent = deadline.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  if (elDays) elDays.textContent = daysLeft > 0 ? `${daysLeft} days remaining` : daysLeft === 0 ? 'Deadline is today!' : `${Math.abs(daysLeft)} days past deadline`;
  if (elBar) {
    elBar.style.width = `${pct}%`;
    elBar.classList.remove('warning', 'danger');
    if (daysLeft <= 30) elBar.classList.add('danger');
    else if (daysLeft <= 90) elBar.classList.add('warning');
  }
}

function setupDeadlineEditing() {
  const dateEl = document.getElementById('deadline-date');
  const inputEl = document.getElementById('deadline-input');
  if (!dateEl || !inputEl) return;

  dateEl.addEventListener('click', () => {
    inputEl.value = state.deadline;
    dateEl.classList.add('hidden');
    inputEl.classList.remove('hidden');
    inputEl.focus();
  });

  async function commitChange() {
    inputEl.classList.add('hidden');
    dateEl.classList.remove('hidden');
    if (inputEl.value && inputEl.value !== state.deadline) {
      state.deadline = inputEl.value;
      await saveState();
      updateDeadlineWidget();
      showToast('Goal deadline updated!');
    }
  }

  inputEl.addEventListener('change', commitChange);
  inputEl.addEventListener('blur', commitChange);
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  const interviews = state.applications.filter(a => a.status === 'interview' || a.status === 'offer').length;
  const total = state.applications.length;
  const rate = total === 0 ? 0 : Math.round(state.applications.filter(a => ['screening','interview','offer'].includes(a.status)).length / total * 100);

  document.getElementById('dashboard-stats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Companies Watching</div><div class="stat-value">${state.companies.length}</div></div>
    <div class="stat-card"><div class="stat-label">Applications Sent</div><div class="stat-value">${total}</div></div>
    <div class="stat-card"><div class="stat-label">Interviews</div><div class="stat-value">${interviews}</div></div>
    <div class="stat-card accent"><div class="stat-label">Response Rate</div><div class="stat-value">${rate}%</div></div>
  `;

  const recent = [...state.applications].sort((a, b) => new Date(b.dateApplied) - new Date(a.dateApplied)).slice(0, 5);
  const recentEl = document.getElementById('recent-apps-list');
  recentEl.innerHTML = recent.length === 0
    ? `<div class="empty-state"><p>No applications yet.</p><button class="btn btn-primary btn-sm" id="empty-log-app">+ Log Application</button></div>`
    : recent.map(a => `
        <div class="recent-app-row">
          <div class="recent-app-info"><strong>${esc(a.title)}</strong><div class="recent-app-meta">${esc(a.company)} · ${formatDate(a.dateApplied)}</div></div>
          <span class="status-badge ${esc(a.status)}">${esc(a.status)}</span>
        </div>`).join('');
  document.getElementById('empty-log-app')?.addEventListener('click', () => openModal('modal-app-overlay'));

  const counts = { applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0 };
  state.applications.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
  document.getElementById('pipeline').innerHTML = ['applied','screening','interview','offer','rejected'].map((s, i, arr) =>
    `<div class="pipeline-stage"><div class="pipeline-count${s==='offer'?' offer':s==='rejected'?' rejected':''}">${counts[s]}</div><div class="pipeline-label">${s}</div></div>${i < arr.length-1 ? '<span class="pipeline-arrow">→</span>' : ''}`
  ).join('');
}

// ── COMPANIES ─────────────────────────────────────────────────────────────────
function renderCompanies() {
  const grid = document.getElementById('companies-grid');
  const sorted = [...state.companies].sort((a,b) => (PRIORITY_ORDER[a.priority]??2)-(PRIORITY_ORDER[b.priority]??2));
  if (!sorted.length) {
    grid.innerHTML = `<div class="companies-empty"><div class="card"><div class="companies-empty-emoji">🏢</div><p style="color:var(--text2);margin-bottom:1rem">No companies added yet.</p><button class="btn btn-primary" id="empty-add-co">+ Add Company</button></div></div>`;
    document.getElementById('empty-add-co')?.addEventListener('click', () => openModal('modal-company-overlay'));
    return;
  }
  grid.innerHTML = sorted.map(co => `
    <div class="company-card priority-${esc(co.priority)}">
      <button class="company-delete" data-id="${esc(co.id)}" aria-label="Remove ${esc(co.name)}">✕</button>
      <div class="company-name">${esc(co.name)}</div>
      <div class="company-industry">${esc(co.industry||'Other')}</div>
      <div class="company-links">
        ${safeUrl(co.careersUrl) ? `<a class="btn btn-sm btn-link" href="${esc(safeUrl(co.careersUrl))}" target="_blank" rel="noopener noreferrer">🔗 Careers Page</a>` : ''}
        ${safeUrl(co.linkedinUrl) ? `<a class="btn btn-sm btn-linkedin" href="${esc(safeUrl(co.linkedinUrl))}" target="_blank" rel="noopener noreferrer">in LinkedIn Jobs</a>` : ''}
        ${!co.careersUrl && !co.linkedinUrl ? '<span class="no-url">No URL added</span>' : ''}
      </div>
      ${co.roles ? `<div class="company-targeting"><span>Targeting:</span> ${esc(co.roles)}</div>` : ''}
      ${co.notes ? `<div class="company-notes">${esc(co.notes)}</div>` : ''}
    </div>`).join('');
  grid.querySelectorAll('.company-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remove this company?')) return;
      state.companies = state.companies.filter(c => c.id !== btn.dataset.id);
      await saveState(); renderCompanies(); if (currentPage==='dashboard') renderDashboard(); showToast('Company removed.');
    });
  });
}

// ── APPLICATIONS ──────────────────────────────────────────────────────────────
function renderApplications() {
  const fb = document.getElementById('filter-bar');
  fb.innerHTML = STATUS_FILTERS.map(f =>
    `<button class="filter-pill${appFilter===f?' active':''}" data-filter="${f}">${f==='all'?'All':f[0].toUpperCase()+f.slice(1)}</button>`
  ).join('');
  fb.querySelectorAll('.filter-pill').forEach(b => b.addEventListener('click', () => { appFilter = b.dataset.filter; renderApplications(); }));

  let apps = [...state.applications].sort((a,b) => new Date(b.dateApplied)-new Date(a.dateApplied));
  if (appFilter !== 'all') apps = apps.filter(a => a.status === appFilter);

  const tbody = document.getElementById('apps-table-body');
  if (!apps.length) { tbody.innerHTML = `<tr><td colspan="7" class="table-empty">No applications found.</td></tr>`; return; }

  tbody.innerHTML = apps.map(a => `
    <tr>
      <td><strong>${esc(a.title)}</strong></td>
      <td>${esc(a.company)}</td>
      <td>${formatDate(a.dateApplied)}</td>
      <td>
        <select class="status-select status-${esc(a.status)}" data-id="${esc(a.id)}">
          ${['applied','screening','interview','offer','rejected'].map(s => `<option value="${s}"${a.status===s?' selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}
        </select>
      </td>
      <td><span class="track-badge">${esc(a.track)}</span></td>
      <td class="notes-cell" title="${esc(a.notes)}">${esc(a.notes)}</td>
      <td><div class="table-actions">
        ${safeUrl(a.jobUrl) ? `<a class="action-link" href="${esc(safeUrl(a.jobUrl))}" target="_blank" rel="noopener noreferrer" aria-label="View job posting">↗</a>` : ''}
        <button class="action-delete" data-id="${esc(a.id)}" aria-label="Delete application">✕</button>
      </div></td>
    </tr>`).join('');

  tbody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      const app = state.applications.find(a => a.id === sel.dataset.id);
      if (!app) return;
      app.status = sel.value;
      await saveState(); renderApplications(); if (currentPage==='dashboard') renderDashboard(); showToast('Status updated.');
    });
  });
  tbody.querySelectorAll('.action-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this application?')) return;
      state.applications = state.applications.filter(a => a.id !== btn.dataset.id);
      await saveState(); renderApplications(); if (currentPage==='dashboard') renderDashboard(); showToast('Application deleted.');
    });
  });
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getRandomSuggestions(trackKey, count = 4) {
  const pool = SUGGESTIONS[trackKey] || [];
  return shuffleArray(pool).slice(0, count);
}

// ── SUGGESTED ─────────────────────────────────────────────────────────────────
function renderSuggested() {
  const banner = document.getElementById('suggested-banner');
  banner.innerHTML = state.companies.length === 0
    ? `<div class="info-banner">Add companies to My Companies first. Or browse by track below.</div>` : '';

  document.getElementById('track-grid').innerHTML = TRACKS.map(t => `
    <div class="track-card${selectedTrack===t.key?' selected':''}" data-track="${t.key}">
      <div class="track-card-icon"><span class="track-tag ${t.tagClass}">${t.tag}</span></div>
      <div class="track-card-title">${esc(t.label)}</div>
      <div class="track-card-desc">${esc(t.desc)}</div>
    </div>`).join('');
  document.getElementById('track-grid').querySelectorAll('[data-track]').forEach(c =>
    c.addEventListener('click', () => { selectedTrack = c.dataset.track; renderSuggestions(); })
  );

  renderSuggestions();
}

function renderSuggestions() {
  document.querySelectorAll('.track-card').forEach(c => c.classList.toggle('selected', c.dataset.track === selectedTrack));

  const resultsEl = document.getElementById('suggestions-results');
  if (!selectedTrack) { resultsEl.innerHTML = ''; return; }
  const picks = getRandomSuggestions(selectedTrack, 6);
  resultsEl.innerHTML = `
    <div style="grid-column:1/-1;display:flex;justify-content:flex-end;margin-bottom:-0.5rem">
      <button class="btn btn-sm btn-ghost" id="btn-shuffle-suggestions">🔁 Show different companies</button>
    </div>
  ` + picks.map(s => `
    <div class="suggestion-card">
      <div class="suggestion-name">${esc(s.name)}</div>
      <div class="suggestion-why">${esc(s.why)}</div>
      <div class="suggestion-actions">
        <button class="btn btn-sm btn-primary" data-name="${esc(s.name)}" data-url="${esc(s.url)}">+ Add to my list</button>
        <a class="btn btn-sm btn-ghost" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">Careers ↗</a>
      </div>
    </div>`).join('');
  resultsEl.querySelectorAll('[data-name]').forEach(btn =>
    btn.addEventListener('click', () => quickAddCompany(btn.dataset.name, btn.dataset.url))
  );
  document.getElementById('btn-shuffle-suggestions')?.addEventListener('click', renderSuggestions);
}

let quickAddInProgress = false;
async function quickAddCompany(name, url) {
  if (quickAddInProgress) return;
  if (state.companies.some(c => c.name.toLowerCase() === name.toLowerCase())) { showToast('Already in your list!', 'error'); return; }
  if (state.companies.length >= MAX_COMPANIES) { showToast(`Company list is full (max ${MAX_COMPANIES}).`, 'error'); return; }
  quickAddInProgress = true;
  try {
    state.companies.push({ id: genId('co'), name, industry:'Tech / Software', careersUrl: sanitizeUrl(url), linkedinUrl:'', roles:'', priority:'medium', notes:'', addedAt:Date.now() });
    await saveState(); showToast(`${name} added! 🎉`); if (currentPage==='companies') renderCompanies(); if (currentPage==='dashboard') renderDashboard();
  } finally {
    quickAddInProgress = false;
  }
}

// ── AUTH UI ───────────────────────────────────────────────────────────────────
function showAuthScreen() {
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
}

function showAppShell() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
}

function setAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!msg) { el.classList.add('hidden'); el.textContent = ''; return; }
  el.textContent = msg;
  el.classList.remove('hidden');
}

function setGreeting(user) {
  const name = (user.displayName && user.displayName.trim())
    || (user.email ? user.email.split('@')[0] : '');
  const h = new Date().getHours();
  const tod = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('dashboard-greeting').textContent = name
    ? `${tod}, ${name} ✦`
    : `${tod} ✦`;
}

function friendlyAuthError(err) {
  const code = err?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Incorrect email or password.';
  if (code.includes('email-already-in-use')) return 'An account with this email already exists. Try logging in instead.';
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
  if (code.includes('invalid-email')) return 'That email address looks invalid.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Please wait a moment and try again.';
  return 'Something went wrong. Please try again.';
}

function setAuthMode(signup) {
  isSignupMode = signup;
  setAuthError(null);
  document.getElementById('auth-title').textContent = signup ? 'Create your account' : 'Welcome back';
  document.getElementById('auth-subtitle').textContent = signup
    ? 'Sign up to start tracking your job hunt.'
    : 'Log in to access your job hunt tracker.';
  document.getElementById('auth-submit-btn').textContent = signup ? 'Sign Up' : 'Log In';
  document.getElementById('auth-toggle-text').textContent = signup ? 'Already have an account?' : "Don't have an account?";
  document.getElementById('auth-toggle-btn').textContent = signup ? 'Log in' : 'Sign up';
  document.getElementById('auth-name-group').classList.toggle('hidden', !signup);
  document.getElementById('auth-name').required = signup;
}

function setupAuthUI() {
  document.getElementById('auth-toggle-btn').addEventListener('click', () => setAuthMode(!isSignupMode));

  async function handleAuthSubmit() {
    const name = document.getElementById('auth-name').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!email || !password) { setAuthError('Please fill in both fields.'); return; }
    if (isSignupMode && !name) { setAuthError('Please enter your name.'); return; }
    setAuthError(null);
    const btn = document.getElementById('auth-submit-btn');
    btn.disabled = true;
    try {
      if (isSignupMode) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        setGreeting(cred.user);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // onAuthStateChanged handles the rest
    } catch (err) {
      console.error('Auth error:', err);
      setAuthError(friendlyAuthError(err));
    } finally {
      btn.disabled = false;
    }
  }

  document.getElementById('auth-submit-btn').addEventListener('click', handleAuthSubmit);
  document.getElementById('auth-form').addEventListener('submit', (e) => { e.preventDefault(); handleAuthSubmit(); });

  document.getElementById('btn-logout').addEventListener('click', async () => {
    if (!confirm('Log out of LaunchPad?')) return;
    await signOut(auth);
  });
}

// ── NAVIGATION ────────────────────────────────────────────────────────────────
function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  ({ dashboard:renderDashboard, companies:renderCompanies, applications:renderApplications, suggested:renderSuggested })[page]?.();
}

// ── MODALS ────────────────────────────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id)?.classList.remove('hidden');
  if (id === 'modal-app-overlay') {
    // only set date if field is empty — preserves value if modal was closed and reopened
    const dateField = document.getElementById('app-date');
    if (!dateField.value) dateField.value = todayISO();
  }
}
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

// ── APP EVENT WIRING (runs once) ─────────────────────────────────────────────
let appWired = false;
function wireAppEventsOnce() {
  if (appWired) return;
  appWired = true;

  document.querySelectorAll('.nav-item').forEach(btn =>
    btn.addEventListener('click', () => navigateTo(btn.dataset.page))
  );

  document.getElementById('btn-log-app-dashboard').addEventListener('click', () => openModal('modal-app-overlay'));
  document.getElementById('btn-log-app').addEventListener('click', () => openModal('modal-app-overlay'));
  document.getElementById('btn-add-company').addEventListener('click', () => openModal('modal-company-overlay'));

  document.querySelectorAll('[data-close]').forEach(btn =>
    btn.addEventListener('click', () => closeModal(btn.dataset.close))
  );
  document.querySelectorAll('.modal-overlay').forEach(overlay =>
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); })
  );

  document.getElementById('btn-save-company').addEventListener('click', async () => {
    const name = document.getElementById('co-name').value.trim();
    if (!name) { showToast('Company name is required.', 'error'); return; }
    if (state.companies.some(c => c.name.toLowerCase() === name.toLowerCase())) { showToast('A company with that name is already in your list.', 'error'); return; }
    if (state.companies.length >= MAX_COMPANIES) { showToast(`Company list is full (max ${MAX_COMPANIES}).`, 'error'); return; }
    const careersUrl = sanitizeUrl(document.getElementById('co-careers').value);
    const linkedinUrl = sanitizeUrl(document.getElementById('co-linkedin').value);
    if (document.getElementById('co-careers').value.trim() && !careersUrl) { showToast('Careers URL must start with http:// or https://', 'error'); return; }
    if (document.getElementById('co-linkedin').value.trim() && !linkedinUrl) { showToast('LinkedIn URL must start with http:// or https://', 'error'); return; }
    const btn = document.getElementById('btn-save-company');
    btn.disabled = true;
    try {
      state.companies.push({
        id: genId('co'),
        name,
        industry: document.getElementById('co-industry').value,
        careersUrl,
        linkedinUrl,
        roles: document.getElementById('co-roles').value.trim(),
        priority: document.getElementById('co-priority').value,
        notes: document.getElementById('co-notes').value.trim(),
        addedAt: Date.now(),
      });
      await saveState();
      document.getElementById('form-company').reset();
      closeModal('modal-company-overlay');
      if (currentPage === 'companies') renderCompanies();
      if (currentPage === 'dashboard') renderDashboard();
      showToast(`${name} added!`);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('btn-save-app').addEventListener('click', async () => {
    const title = document.getElementById('app-title').value.trim();
    const company = document.getElementById('app-company').value.trim();
    if (!title || !company) { showToast('Role and company are required.', 'error'); return; }
    if (state.applications.length >= MAX_APPLICATIONS) { showToast(`Application list is full (max ${MAX_APPLICATIONS}).`, 'error'); return; }
    const jobUrl = sanitizeUrl(document.getElementById('app-url').value);
    if (document.getElementById('app-url').value.trim() && !jobUrl) { showToast('Job URL must start with http:// or https://', 'error'); return; }
    const btn = document.getElementById('btn-save-app');
    btn.disabled = true;
    try {
      state.applications.push({
        id: genId('app'),
        title,
        company,
        track: document.getElementById('app-track').value,
        dateApplied: document.getElementById('app-date').value || todayISO(),
        status: document.getElementById('app-status').value,
        jobUrl,
        notes: document.getElementById('app-notes').value.trim(),
        createdAt: Date.now(),
      });
      await saveState();
      document.getElementById('form-app').reset();
      closeModal('modal-app-overlay');
      if (currentPage === 'applications') renderApplications();
      if (currentPage === 'dashboard') renderDashboard();
      showToast('Application logged!');
    } finally {
      btn.disabled = false;
    }
  });

  // close modals on Escape key (draft state preserved — forms not reset)
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('.modal-overlay:not(.hidden)');
    if (!open) return;
    closeModal(open.id);
  });

  setupDeadlineEditing();
}

// ── INIT ──────────────────────────────────────────────────────────────────────
function init() {
  setupAuthUI();
  showLoading();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      document.getElementById('account-email').textContent = user.email || '';
      setGreeting(user);
      await loadState();
      wireAppEventsOnce();
      updateDeadlineWidget();
      navigateTo('dashboard');
      showAppShell();
    } else {
      currentUser = null;
      setAuthMode(false);
      showAuthScreen();
    }
    hideLoading();
  });
}

document.addEventListener('DOMContentLoaded', init);