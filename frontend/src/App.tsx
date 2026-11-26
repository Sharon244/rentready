
import { useEffect, useState } from 'react';
import {
  Home,
  Calculator,
  FileText,
  HeartHandshake,
  Search,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  Upload,
  X,
  Heart
} from 'lucide-react';

import {
  calculate,
  analyse,
  properties,
  support,
  analyseProperty,
  type Budget
} from './api';

const initial: Budget = {
  monthly_income: 1500,
  rent: 650,
  electricity_gas: 100,
  water: 30,
  council_tax: 100,
  internet: 30,
  food: 150,
  transport: 80,
  other_expenses: 100,
  deposit: 650,
  moving_costs: 100
};

const money = (n: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(n);

type Tab = 'home' | 'budget' | 'tenancy' | 'homes' | 'checker' | 'support';

type Property = {
  id: string;
  title: string;
  location: string;
  monthly_rent: number;
  bedrooms: number;
  description: string;
  is_demo?: boolean;
};

export default function App() {
  const [tab, setTab] = useState<Tab>('home');

  const [v, setV] = useState<Budget>(initial);
  const [result, setResult] = useState<any>();
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [list, setList] = useState<Property[]>([]);
  const [help, setHelp] = useState<any>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Explore Homes states
  const [locationSearch, setLocationSearch] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  // AI Property Checker states
  const [propertyTitle, setPropertyTitle] = useState('');
  const [propertyLocation, setPropertyLocation] = useState('');
  const [propertyRent, setPropertyRent] = useState('');
  const [listingText, setListingText] = useState('');
  const [landlordMessage, setLandlordMessage] = useState('');
  const [propertyAnalysis, setPropertyAnalysis] = useState('');

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem('rentready-saved-homes') || '[]'
      );
    } catch {
      return [];
    }
  });

  const [selectedProperty, setSelectedProperty] =
    useState<Property | null>(null);

  // Load demonstration properties
  useEffect(() => {
    properties()
      .then(x => setList(x.properties))
      .catch(() => setError('Unable to load properties.'));
  }, []);

  // Save bookmarks in browser storage
  useEffect(() => {
    localStorage.setItem(
      'rentready-saved-homes',
      JSON.stringify(savedIds)
    );
  }, [savedIds]);

  // Navigation
  const nav: [Tab, string, any][] = [
    ['home', 'Overview', Home],
    ['budget', 'Affordability', Calculator],
    ['tenancy', 'Tenancy checker', FileText],
    ['homes', 'Explore homes', Search],
    ['checker', 'Property checker', ShieldCheck],
    ['support', 'Housing support', HeartHandshake]
  ];

  // Budget input handler
  const set = (k: keyof Budget, x: string) =>
    setV(old => ({
      ...old,
      [k]: Math.max(0, Number(x) || 0)
    }));

  const field = (key: keyof Budget, label: string) => (
    <label className="field" key={key}>
      {label}
      <span>
        £
        <input
          type="number"
          min="0"
          step=".01"
          value={v[key]}
          onChange={e => set(key, e.target.value)}
        />
      </span>
    </label>
  );

  // Affordability calculation
  async function doCalc(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      setResult(await calculate(v));
    } catch (x) {
      setError(String(x));
    } finally {
      setBusy(false);
    }
  }

  // AI tenancy analysis
  async function doAnalysis() {
    if (!file) return;

    setBusy(true);
    setError('');

    try {
      const x = await analyse(file);
      setAnalysis(x.analysis);
    } catch (x) {
      setError(String(x));
    } finally {
      setBusy(false);
    }
  }

  // AI property warning checker
  async function doPropertyAnalysis(e: React.FormEvent) {
    e.preventDefault();

    if (!listingText.trim() && !landlordMessage.trim()) {
      setError('Please enter a property description or landlord message.');
      return;
    }

    setBusy(true);
    setError('');
    setPropertyAnalysis('');

    try {
      const response = await analyseProperty({
        title: propertyTitle,
        location: propertyLocation,
        monthly_rent: propertyRent,
        listing_text: listingText,
        landlord_message: landlordMessage
      });

      setPropertyAnalysis(response.analysis);
    } catch (x) {
      setError(String(x));
    } finally {
      setBusy(false);
    }
  }

  // Housing support
  async function doSupport() {
    setBusy(true);
    setError('');

    try {
      setHelp(await support());
    } catch (x) {
      setError(String(x));
    } finally {
      setBusy(false);
    }
  }

  // Filter properties
  const filteredHomes = list.filter(p => {
    const matchesLocation = p.location
      .toLowerCase()
      .includes(locationSearch.toLowerCase().trim());

    const matchesRent =
      maxRent === '' || p.monthly_rent <= Number(maxRent);

    const matchesBedrooms =
      bedrooms === '' || p.bedrooms === Number(bedrooms);

    return matchesLocation && matchesRent && matchesBedrooms;
  });

  // Save or unsave a property
  function toggleSaved(id: string) {
    setSavedIds(old =>
      old.includes(id)
        ? old.filter(savedId => savedId !== id)
        : [...old, id]
    );
  }

  // Clear property filters
  function clearFilters() {
    setLocationSearch('');
    setMaxRent('');
    setBedrooms('');
  }

  const savedProperties = list.filter(p =>
    savedIds.includes(p.id)
  );

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <aside>
        <div className="logo">
          <b>R</b> rentready<span>.</span>
        </div>

        <small>YOUR HOUSING COMPANION</small>

        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              className={tab === id ? 'selected' : ''}
              onClick={() => setTab(id)}
              key={id}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <p className="tagline">
          Clearer choices. Safer moves.
        </p>
      </aside>

      {/* MAIN CONTENT */}
      <main>
        <header>
          <div>
            <small>UK HOUSING, MADE CLEARER</small>
            <h1>{nav.find(x => x[0] === tab)?.[1]}</h1>
          </div>
          <b className="avatar">R</b>
        </header>

        {error && <p className="error">{error}</p>}

        {/* OVERVIEW */}
        {tab === 'home' && (
          <section>
            <div className="hero">
              <div>
                <label>A SMARTER WAY TO RENT</label>

                <h2>
                  Make your next move{' '}
                  <i>with confidence.</i>
                </h2>

                <p>
                  Understand the real cost of a home,
                  make sense of your tenancy and find
                  support that could help.
                </p>

                <button
                  className="primary"
                  onClick={() => setTab('budget')}
                >
                  Check what you can afford
                  <ArrowUpRight size={17} />
                </button>
              </div>

              <div className="house-art">
                <div className="roof" />
                <div className="house">
                  <div />
                  <div />
                </div>
              </div>
            </div>

            <h2 className="section-title">
              Everything in one place
            </h2>

            <div className="tiles">
              {[
                [
                  'budget',
                  Wallet,
                  'Know your numbers',
                  'See rent, bills and moving costs together.'
                ],
                [
                  'tenancy',
                  FileText,
                  'Understand your tenancy',
                  'Upload an agreement and unpack the wording.'
                ],
                [
                  'homes',
                  Search,
                  'Explore homes',
                  'Compare example listings while we build live search.'
                ],
                [
                  'support',
                  HeartHandshake,
                  'Find support',
                  'Get pointed towards trusted UK housing help.'
                ]
              ].map(([id, Icon, title, desc]: any) => (
                <button
                  className="tile"
                  onClick={() => setTab(id)}
                  key={id}
                >
                  <Icon />
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </button>
              ))}
            </div>

            <div className="notice">
              <ShieldCheck />
              RentReady provides information and estimates.
              It does not certify properties, give legal advice
              or decide benefit eligibility.
            </div>
          </section>
        )}

        {/* AFFORDABILITY */}
        {tab === 'budget' && (
          <section>
            <div className="intro">
              <small>AFFORDABILITY PLANNER</small>
              <h2>
                What will living here <i>really cost?</i>
              </h2>
              <p>
                Add your monthly take-home income and expenses.
              </p>
            </div>

            <form className="budget" onSubmit={doCalc}>
              <div className="card">
                <h3>Your monthly budget</h3>

                <div className="fields">
                  {field('monthly_income', 'Take-home income')}
                  {field('rent', 'Monthly rent')}
                  {field('electricity_gas', 'Gas & electricity')}
                  {field('water', 'Water')}
                  {field('council_tax', 'Council tax')}
                  {field('internet', 'Internet')}
                  {field('food', 'Food')}
                  {field('transport', 'Transport')}
                  {field('other_expenses', 'Other expenses')}
                </div>

                <h3 className="divider">
                  Upfront moving costs
                </h3>

                <div className="fields">
                  {field('deposit', 'Deposit')}
                  {field('moving_costs', 'Other moving costs')}
                </div>

                <button className="primary" disabled={busy}>
                  {busy ? 'Calculating...' : 'Calculate my budget'}
                  <ArrowUpRight size={17} />
                </button>
              </div>

              <div className="result">
                <small>YOUR ESTIMATE</small>

                {result ? (
                  <>
                    <p>Money left each month</p>
                    <strong>{money(result.remaining_income)}</strong>
                    <label>{result.status}</label>

                    {[
                      ['Housing costs', result.housing_costs],
                      ['All monthly expenses', result.total_expenses],
                      [
                        'Income spent on housing',
                        result.housing_percentage + '%'
                      ],
                      [
                        'Estimated upfront costs',
                        result.initial_moving_cost
                      ]
                    ].map(([a, b]: any) => (
                      <div className="result-row" key={a}>
                        <span>{a}</span>
                        <b>
                          {typeof b === 'number' &&
                          a !== 'Income spent on housing'
                            ? money(b)
                            : b}
                        </b>
                      </div>
                    ))}

                    <p className="fine">{result.disclaimer}</p>
                  </>
                ) : (
                  <p className="placeholder">
                    Your results will appear here after you
                    calculate your budget.
                  </p>
                )}
              </div>
            </form>
          </section>
        )}

        {/* TENANCY CHECKER */}
        {tab === 'tenancy' && (
          <section className="narrow">
            <div className="intro">
              <small>TENANCY EXPLAINER</small>
              <h2>
                Make the small print <i>make sense.</i>
              </h2>
              <p>
                Upload a text-based PDF, DOCX or TXT agreement
                for a plain-English explanation.
              </p>
            </div>

            <div className="card centered">
              <Upload size={30} />
              <h3>Upload your tenancy agreement</h3>
              <p>PDF, DOCX or TXT · Maximum 8 MB</p>

              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={e =>
                  setFile(e.target.files?.[0] || null)
                }
              />

              {file && <p>{file.name}</p>}

              <button
                className="primary"
                disabled={!file || busy}
                onClick={doAnalysis}
              >
                {busy ? 'Reviewing...' : 'Explain my agreement'}
                <ArrowUpRight size={17} />
              </button>

              {analysis && <pre>{analysis}</pre>}
            </div>

            <div className="notice">
              Only upload a document you are comfortable
              processing. Remove personal details first.
              This is not legal advice.
            </div>
          </section>
        )}

        {/* EXPLORE HOMES */}
        {tab === 'homes' && (
          <section>
            <div className="intro">
              <small>PROPERTY EXPLORER</small>
              <h2>
                Find a place that fits <i>your life.</i>
              </h2>
              <p>
                Search example properties and find a home
                within your budget.
              </p>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="home-filters">
              <div className="filter-field">
                <label>Search location</label>
                <input
                  type="text"
                  placeholder="e.g. York, Leeds..."
                  value={locationSearch}
                  onChange={e => setLocationSearch(e.target.value)}
                />
              </div>

              <div className="filter-field">
                <label>Maximum monthly rent (£)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Any budget"
                  value={maxRent}
                  onChange={e => setMaxRent(e.target.value)}
                />
              </div>

              <div className="filter-field">
                <label>Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={e => setBedrooms(e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="1">1 bedroom</option>
                  <option value="2">2 bedrooms</option>
                  <option value="3">3 bedrooms</option>
                  <option value="4">4 bedrooms</option>
                </select>
              </div>

              <button
                className="filter-reset"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>

            {/* RESULTS HEADER */}
            <div className="homes-heading">
              <h3>Example properties</h3>
              <span>
                {filteredHomes.length} properties found
              </span>
            </div>

            {/* PROPERTY CARDS */}
            <div className="homes">
              {filteredHomes.map(p => (
                <article className="property" key={p.id}>
                  <div className="property-art">
                    <Home size={34} />
                    <b>DEMO LISTING</b>
                  </div>

                  <div className="property-content">
                    <small>
                      {p.location} · {p.bedrooms} BED
                    </small>

                    <h3>{p.title}</h3>
                    <p>{p.description}</p>

                    <strong>
                      {money(p.monthly_rent)}
                      <small> / month</small>
                    </strong>

                    <div className="property-actions">
                      <button
                        className="details-button"
                        onClick={() => setSelectedProperty(p)}
                      >
                        View details
                      </button>

                      <button
                        className="save-button"
                        onClick={() => toggleSaved(p.id)}
                      >
                        <Heart
                          size={16}
                          fill={
                            savedIds.includes(p.id)
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                        {savedIds.includes(p.id)
                          ? 'Saved'
                          : 'Save'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* EMPTY SEARCH RESULTS */}
            {filteredHomes.length === 0 && (
              <div className="empty-homes">
                <Home size={30} />
                <h3>No properties found</h3>
                <p>
                  Try changing your search or clearing
                  your filters.
                </p>
                <button
                  className="filter-reset"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* SAVED PROPERTIES */}
            <div className="saved-summary">
              <h3>
                <Heart size={18} /> Your saved properties
              </h3>

              <p>{savedProperties.length} properties saved</p>

              {savedProperties.length === 0 && (
                <p className="placeholder">
                  Properties you save will appear here.
                </p>
              )}

              {savedProperties.map(p => (
                <div className="saved-property" key={p.id}>
                  <button
                    className="saved-title"
                    onClick={() => setSelectedProperty(p)}
                  >
                    {p.title} — {money(p.monthly_rent)}/month
                  </button>

                  <button onClick={() => toggleSaved(p.id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* PROPERTY DETAILS MODAL */}
            {selectedProperty && (
              <div
                className="property-modal"
                onClick={e => {
                  if (e.target === e.currentTarget) {
                    setSelectedProperty(null);
                  }
                }}
              >
                <div className="property-modal-content">
                  <button
                    className="modal-close"
                    onClick={() => setSelectedProperty(null)}
                    aria-label="Close property details"
                  >
                    <X size={20} />
                  </button>

                  <small>DEMONSTRATION PROPERTY</small>

                  <h2>{selectedProperty.title}</h2>

                  <p>{selectedProperty.location}</p>

                  <h2 className="modal-price">
                    {money(selectedProperty.monthly_rent)}
                    <small> / month</small>
                  </h2>

                  <div className="detail-row">
                    <span>Bedrooms</span>
                    <b>{selectedProperty.bedrooms}</b>
                  </div>

                  <div className="detail-row">
                    <span>Location</span>
                    <b>{selectedProperty.location}</b>
                  </div>

                  <div className="detail-row">
                    <span>Listing status</span>
                    <b>Demonstration only</b>
                  </div>

                  <p>{selectedProperty.description}</p>

                  <div className="notice">
                    These are fictional demonstration listings.
                    Property availability, landlord details and
                    rental terms have not been verified.
                  </div>

                  <button
                    className="primary"
                    onClick={() =>
                      toggleSaved(selectedProperty.id)
                    }
                  >
                    {savedIds.includes(selectedProperty.id)
                      ? 'Remove from saved'
                      : 'Save this property'}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* AI PROPERTY CHECKER */}
        {tab === 'checker' && (
          <section className="narrow">
            <div className="intro">
              <small>AI PROPERTY SAFETY CHECK</small>
              <h2>
                Before you pay, <i>check the details.</i>
              </h2>
              <p>
                Share a rental advert or message from a landlord or agent.
                RentReady will identify potential warning signs and suggest
                what you should verify before proceeding.
              </p>
            </div>

            <form
              className="card property-checker"
              onSubmit={doPropertyAnalysis}
            >
              <h3>Property information</h3>

              <label className="field">
                Property title
                <input
                  type="text"
                  placeholder="e.g. Modern city centre studio"
                  value={propertyTitle}
                  onChange={e => setPropertyTitle(e.target.value)}
                />
              </label>

              <label className="field">
                Location
                <input
                  type="text"
                  placeholder="e.g. York"
                  value={propertyLocation}
                  onChange={e => setPropertyLocation(e.target.value)}
                />
              </label>

              <label className="field">
                Advertised monthly rent (£)
                <input
                  type="text"
                  placeholder="e.g. 650"
                  value={propertyRent}
                  onChange={e => setPropertyRent(e.target.value)}
                />
              </label>

              <label className="field">
                Property advert description
                <textarea
                  rows={5}
                  placeholder="Paste the rental advert here..."
                  value={listingText}
                  onChange={e => setListingText(e.target.value)}
                />
              </label>

              <label className="field">
                Landlord or agent messages
                <textarea
                  rows={5}
                  placeholder="Paste any messages you have received..."
                  value={landlordMessage}
                  onChange={e => setLandlordMessage(e.target.value)}
                />
              </label>

              <button
                className="primary"
                type="submit"
                disabled={busy}
              >
                {busy ? 'Checking property...' : 'Analyse property'}
                <ShieldCheck size={17} />
              </button>

              {propertyAnalysis && (
                <div className="property-analysis">
                  <h3>Property analysis</h3>
                  <pre>{propertyAnalysis}</pre>
                </div>
              )}
            </form>

            <div className="notice">
              This tool identifies potential warning signs based only on
              the information you provide. It cannot confirm whether a
              property or landlord is genuine. Always verify details
              independently before transferring money.
            </div>
          </section>
        )}

        {/* HOUSING SUPPORT */}
        {tab === 'support' && (
          <section className="narrow">
            <div className="intro">
              <small>SUPPORT DIRECTORY</small>
              <h2>
                You don't have to figure it out <i>alone.</i>
              </h2>
              <p>
                Start with trusted organisations and official
                guidance. Support depends on your circumstances
                and where you live.
              </p>
            </div>

            <div className="card">
              <h3>Find a starting point</h3>

              <button
                className="primary"
                onClick={doSupport}
                disabled={busy}
              >
                Show housing support resources
                <ArrowUpRight size={17} />
              </button>

              {help && (
                <div>
                  {help.notice}

                  {help.suggestions.map((s: any) => (
                    <a
                      className="support-link"
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      key={s.name}
                    >
                      <b>{s.name}</b>
                      <p>{s.why}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <footer>
          © 2026 RentReady
          <span>Information for clearer housing decisions.</span>
        </footer>
      </main>
    </div>
  );
}
