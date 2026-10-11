import type {
  Approval,
  Booking,
  DiaryEntry,
  Doc,
  FeedItem,
  NearMiss,
  Nominee,
  Permit,
  Profile,
  Project,
  Resource,
  Rfi,
  Snag,
  Subbie,
  Toolbox,
  Valuation,
  Variation,
} from './types'

export const GBP_TO_EUR = 1.17
export const MARGIN_THRESHOLD = 8

export const profiles: Profile[] = [
  { id: 'john', name: 'John McCormack', first: 'John', initials: 'JM', role: 'Director of Construction' },
  {
    id: 'ciara',
    name: 'Ciara Doyle',
    first: 'Ciara',
    initials: 'CD',
    role: 'Contracts Manager, Dublin',
    sites: ['gcd', 'ifsc', 'sandyford', 'cherrywood'],
  },
  { id: 'mark', name: 'Mark Feeney', first: 'Mark', initials: 'MF', role: 'Site Manager, Grand Canal Dock', homeSite: 'gcd' },
  { id: 'owen', name: 'Owen Rafferty', first: 'Owen', initials: 'OR', role: 'Site Manager, Manchester', homeSite: 'manchester' },
  { id: 'niamh', name: 'Niamh Kelly', first: 'Niamh', initials: 'NK', role: 'Commercial Manager / QS' },
  { id: 'declan', name: 'Declan Ward', first: 'Declan', initials: 'DW', role: 'Health & Safety Manager' },
]

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

/** A time `days` ago at a given clock time. Today's entries are given as minutes ago instead so they never land in the future. */
function at(days: number, hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(Date.now() - days * DAY)
  d.setHours(h, m, 0, 0)
  return d.getTime()
}
const ago = (mins: number) => Date.now() - mins * MIN

function projects(): Project[] {
  return [
    {
      id: 'gcd',
      name: 'Grand Canal Dock',
      area: 'Dublin 2',
      city: 'Dublin',
      country: 'IE',
      currency: 'EUR',
      sector: 'Office',
      scope: 'Cat B office fit-out, floors 3 to 5',
      size: '4,200 m2',
      client: 'Harbourline Technologies',
      architect: 'Fennell Kerr Architects',
      pm: 'Lansdowne Project Management',
      siteManager: 'Mark Feeney',
      contractsManager: 'Ciara Doyle',
      contract: 3_800_000,
      budget: 3_420_000,
      committed: 2_712_400,
      costToDate: 2_046_900,
      forecastBase: 3_354_300,
      committedThisWeek: 64_200,
      weekNow: 14,
      weekTotal: 22,
      pct: 62,
      rag: 'green',
      statusLine: 'On programme',
      daysBehind: 0,
      marginHistory: [11.2, 11.4, 11.6, 11.5, 11.8, 11.9, 12.1],
      milestones: [
        { name: 'Site possession', week: 1, done: true },
        { name: 'Partitions complete L3 to L5', week: 9, done: true },
        { name: 'M&E first fix complete', week: 12, done: true },
        { name: 'Ceilings closed L3 and L4', week: 16, done: false },
        { name: 'Joinery and tea points', week: 19, done: false },
        { name: 'Commissioning', week: 21, done: false },
        { name: 'Practical completion', week: 22, done: false },
      ],
      weather: { temp: 12, cond: 'Cloudy', wind: 18, rain: 20 },
      onSite: [
        { company: 'Roccul', trade: 'Management and carpentry', count: 7 },
        { company: 'Apex Ceilings', trade: 'Ceilings', count: 6 },
        { company: 'Kilbride M&E', trade: 'Mechanical and electrical', count: 11 },
        { company: 'Drywall Dynamics', trade: 'Drylining', count: 6 },
        { company: 'Floorline Contracts', trade: 'Flooring', count: 4 },
      ],
      planned: [
        { id: 'p1', text: 'L4 east wing ceiling grid, gridlines 6 to 11', done: true },
        { id: 'p2', text: 'Fire stopping inspection L3 risers with Fennell Kerr', done: true },
        { id: 'p3', text: 'Kilbride second fix lighting L3 open plan', done: false },
        { id: 'p4', text: 'Raised access floor L5 west, 180 m2', done: false },
        { id: 'p5', text: 'Joinery template for L4 tea point', done: false },
      ],
      tone: ['#2b4a6b', '#0f1c2b'],
      handover: 'Practical completion 18 Dec',
    },
    {
      id: 'ifsc',
      name: 'IFSC',
      area: 'Dublin 1',
      city: 'Dublin',
      country: 'IE',
      currency: 'EUR',
      sector: 'Office',
      scope: 'Fintech HQ fit-out, floors 2 and 3',
      size: '2,600 m2',
      client: 'Ardent Pay',
      architect: 'Studio Quay Architects',
      pm: 'Carrick Project Partners',
      siteManager: 'Paddy Brennan',
      contractsManager: 'Ciara Doyle',
      contract: 2_100_000,
      budget: 1_890_000,
      committed: 1_402_600,
      costToDate: 1_018_300,
      forecastBase: 1_919_500,
      committedThisWeek: 41_800,
      weekNow: 9,
      weekTotal: 16,
      pct: 48,
      rag: 'red',
      statusLine: 'Ceilings 6 days behind',
      daysBehind: 6,
      marginHistory: [10.6, 10.4, 10.1, 9.8, 9.6, 9.3, 9.0],
      milestones: [
        { name: 'Site possession', week: 1, done: true },
        { name: 'Strip out and make good', week: 3, done: true },
        { name: 'Partitions complete', week: 7, done: true },
        { name: 'Ceiling grid complete', week: 9, done: false },
        { name: 'M&E second fix', week: 11, done: false },
        { name: 'Comms room live', week: 13, done: false },
        { name: 'Practical completion', week: 16, done: false },
      ],
      weather: { temp: 12, cond: 'Cloudy', wind: 20, rain: 25 },
      onSite: [
        { company: 'Roccul', trade: 'Management and carpentry', count: 5 },
        { company: 'Apex Ceilings', trade: 'Ceilings', count: 3 },
        { company: 'Kilbride M&E', trade: 'Mechanical and electrical', count: 8 },
        { company: 'Drywall Dynamics', trade: 'Drylining', count: 4 },
        { company: 'Secure Data Cabling', trade: 'Data', count: 2 },
      ],
      planned: [
        { id: 'p1', text: 'Ceiling grid L2 zone B, gridlines C to F', done: true },
        { id: 'p2', text: 'Ceiling grid L2 zone C', done: false },
        { id: 'p3', text: 'Comms room containment, L3', done: true },
        { id: 'p4', text: 'Kilbride second fix L2 zone A (waiting on ceilings)', done: false },
        { id: 'p5', text: 'Glass partition survey with Studio Quay', done: false },
      ],
      tone: ['#4a2d22', '#170f0c'],
      handover: 'Practical completion 29 Jan',
    },
    {
      id: 'sandyford',
      name: 'Sandyford',
      area: 'Dublin 18',
      city: 'Dublin',
      country: 'IE',
      currency: 'EUR',
      sector: 'Critical environment',
      scope: 'Lab and cleanroom refurbishment, ISO 7 suite',
      size: '1,100 m2',
      client: 'Corvane Biologics',
      architect: 'Delta Process Design',
      pm: 'Stanmore Consulting',
      siteManager: 'Aoife Gallagher',
      contractsManager: 'Ciara Doyle',
      contract: 1_600_000,
      budget: 1_400_000,
      committed: 1_104_000,
      costToDate: 842_500,
      forecastBase: 1_394_600,
      committedThisWeek: 22_600,
      weekNow: 11,
      weekTotal: 18,
      pct: 58,
      rag: 'green',
      statusLine: 'On programme, 9 permits live',
      daysBehind: 0,
      marginHistory: [12.4, 12.6, 12.8, 12.9, 13.0, 13.1, 13.2],
      milestones: [
        { name: 'Decommission existing lab', week: 2, done: true },
        { name: 'Cleanroom wall panels', week: 7, done: true },
        { name: 'HVAC and AHU install', week: 10, done: true },
        { name: 'Pressure cascade balancing', week: 13, done: false },
        { name: 'Particle count validation', week: 16, done: false },
        { name: 'Handover to QA', week: 18, done: false },
      ],
      weather: { temp: 11, cond: 'Light showers', wind: 16, rain: 55 },
      onSite: [
        { company: 'Roccul', trade: 'Management', count: 4 },
        { company: 'Pureform Panels', trade: 'Cleanroom panels', count: 4 },
        { company: 'Kilbride M&E', trade: 'HVAC', count: 6 },
        { company: 'Validair', trade: 'Commissioning', count: 2 },
      ],
      planned: [
        { id: 'p1', text: 'AHU-2 isolation and duct tie-in, permit SF-118', done: true },
        { id: 'p2', text: 'Coving and sealant, room 2.14', done: true },
        { id: 'p3', text: 'Pressure stat calibration, airlock 1', done: false },
        { id: 'p4', text: 'Gowning room door interlocks', done: false },
      ],
      tone: ['#1f4a48', '#0b1817'],
      handover: 'Handover to QA 12 Feb',
    },
    {
      id: 'manchester',
      name: 'Spinningfields',
      area: 'Manchester',
      city: 'Manchester',
      country: 'UK',
      currency: 'GBP',
      sector: 'Office',
      scope: 'Office fit-out, floors 6 to 8',
      size: '3,300 m2',
      client: 'Northgate Legal LLP',
      architect: 'Arden Mills Architects',
      pm: 'Castlefield PM',
      siteManager: 'Owen Rafferty',
      contractsManager: 'Tom Hartley',
      contract: 2_900_000,
      budget: 2_640_000,
      committed: 2_118_000,
      costToDate: 1_566_400,
      forecastBase: 2_675_000,
      committedThisWeek: 38_900,
      weekNow: 12,
      weekTotal: 20,
      pct: 57,
      rag: 'amber',
      statusLine: 'Margin slipping, 2 unpriced variations',
      daysBehind: 0,
      marginHistory: [9.9, 9.6, 9.1, 8.6, 8.0, 7.3, 6.9],
      milestones: [
        { name: 'Site possession', week: 1, done: true },
        { name: 'Partitions L6 to L8', week: 8, done: true },
        { name: 'M&E first fix', week: 10, done: true },
        { name: 'Ceilings closed', week: 14, done: false },
        { name: 'Finishes and joinery', week: 17, done: false },
        { name: 'Practical completion', week: 20, done: false },
      ],
      weather: { temp: 11, cond: 'Light rain', wind: 22, rain: 70 },
      onSite: [
        { company: 'Roccul UK', trade: 'Management and carpentry', count: 6 },
        { company: 'Northern Partitions', trade: 'Drylining', count: 8 },
        { company: 'Pennine Ceilings', trade: 'Ceilings', count: 5 },
        { company: 'Irwell Electrical', trade: 'Electrical', count: 7 },
        { company: 'Bridgewater Mechanical', trade: 'Mechanical', count: 3 },
      ],
      planned: [
        { id: 'p1', text: 'L7 ceiling grid, north core to gridline 8', done: true },
        { id: 'p2', text: 'L8 east glazed meeting room setting out', done: true },
        { id: 'p3', text: 'Fire stopping riser walls L7', done: false },
        { id: 'p4', text: 'L6 collaboration zone power, small power second fix', done: false },
        { id: 'p5', text: 'Kitchen worktop template L7', done: false },
      ],
      tone: ['#3d3a52', '#121119'],
      handover: 'Practical completion 22 Jan',
    },
    {
      id: 'newcastle',
      name: 'Quayside',
      area: 'Newcastle',
      city: 'Newcastle',
      country: 'UK',
      currency: 'GBP',
      sector: 'Office',
      scope: 'Office refurbishment, Cat A to Cat B',
      size: '1,850 m2',
      client: 'Tyne Mutual',
      architect: 'Lumen North',
      pm: 'Baltic PM',
      siteManager: 'Gary Robson',
      contractsManager: 'Tom Hartley',
      contract: 1_200_000,
      budget: 1_080_000,
      committed: 1_012_000,
      costToDate: 958_200,
      forecastBase: 1_080_400,
      committedThisWeek: 9_400,
      weekNow: 15,
      weekTotal: 17,
      pct: 91,
      rag: 'amber',
      statusLine: '2 weeks to handover, 38 snags open',
      daysBehind: 0,
      marginHistory: [10.8, 10.7, 10.6, 10.5, 10.5, 10.4, 10.3],
      milestones: [
        { name: 'Site possession', week: 1, done: true },
        { name: 'Partitions and ceilings', week: 9, done: true },
        { name: 'Finishes', week: 13, done: true },
        { name: 'Commissioning', week: 15, done: true },
        { name: 'Snagging and client walk', week: 16, done: false },
        { name: 'Handover', week: 17, done: false },
      ],
      weather: { temp: 9, cond: 'Bright', wind: 14, rain: 10 },
      onSite: [
        { company: 'Roccul UK', trade: 'Management', count: 3 },
        { company: 'Northern Partitions', trade: 'Snagging', count: 4 },
        { company: 'Tyne Decorators', trade: 'Decoration', count: 4 },
        { company: 'Irwell Electrical', trade: 'Electrical', count: 3 },
      ],
      planned: [
        { id: 'p1', text: 'Snag walk L2 with Baltic PM', done: true },
        { id: 'p2', text: 'Decorator touch up, reception and lift lobby', done: false },
        { id: 'p3', text: 'Emergency lighting test certificate', done: false },
        { id: 'p4', text: 'O&M manual draft to Lumen North', done: false },
      ],
      tone: ['#4a4130', '#17140e'],
      handover: 'Handover 30 Oct',
    },
    {
      id: 'cherrywood',
      name: 'Cherrywood',
      area: 'Dublin 18',
      city: 'Dublin',
      country: 'IE',
      currency: 'EUR',
      sector: 'Construction',
      scope: 'Roof and facade replacement, occupied building',
      size: 'Roof 2,400 m2, curtain wall east and south',
      client: 'Glenmore Estates',
      architect: 'Tallis Brady Architects',
      pm: 'Corrib PM',
      siteManager: 'Shane Kavanagh',
      contractsManager: 'Ciara Doyle',
      contract: 1_400_000,
      budget: 1_250_000,
      committed: 712_000,
      costToDate: 486_000,
      forecastBase: 1_247_200,
      committedThisWeek: 31_500,
      weekNow: 8,
      weekTotal: 20,
      pct: 36,
      rag: 'green',
      statusLine: 'On programme, wind watch from 14:00',
      daysBehind: 0,
      marginHistory: [11.0, 11.1, 11.1, 11.2, 11.0, 11.2, 11.3],
      milestones: [
        { name: 'Scaffold and edge protection', week: 2, done: true },
        { name: 'Roof strip, bays 1 to 4', week: 6, done: true },
        { name: 'Roof membrane, bays 1 to 8', week: 11, done: false },
        { name: 'Curtain wall east elevation', week: 15, done: false },
        { name: 'Curtain wall south elevation', week: 18, done: false },
        { name: 'Scaffold strike and handover', week: 20, done: false },
      ],
      weather: {
        temp: 10,
        cond: 'Breezy',
        wind: 31,
        rain: 30,
        note: 'Gusts 41 km/h from 14:00. Boom lift stood down above 38 km/h.',
      },
      onSite: [
        { company: 'Roccul', trade: 'Management', count: 3 },
        { company: 'Summit Roofing', trade: 'Roofing', count: 6 },
        { company: 'Clearview Glazing', trade: 'Facade', count: 3 },
      ],
      planned: [
        { id: 'p1', text: 'Vapour control layer bay 5', done: true },
        { id: 'p2', text: 'Insulation and membrane bay 5, before 14:00', done: false },
        { id: 'p3', text: 'Curtain wall bracket survey east elevation', done: false },
        { id: 'p4', text: 'Tenant notice for Thursday crane lift', done: true },
      ],
      tone: ['#2f3f2a', '#0f140d'],
      handover: 'Scaffold strike 26 Feb',
    },
  ]
}

function variations(): Variation[] {
  const v = (
    ref: string,
    projectId: string,
    title: string,
    status: Variation['status'],
    cost: number,
    value: number,
    raisedBy: string,
    daysAgo: number,
    instruction: string,
    note: string,
  ): Variation => ({ id: `${projectId}-${ref}`, ref, projectId, title, status, cost, value, raisedBy, daysAgo, instruction, note })
  return [
    v('V-021', 'gcd', 'Additional data floor boxes, L3 open plan', 'approved', 14200, 19800, 'Mark Feeney', 26, "Architect's instruction 014 from Fennell Kerr", '12 boxes, Kilbride quote KME-3381'),
    v('V-024', 'gcd', 'Acoustic ceiling raft upgrade, L5 boardroom', 'approved', 22600, 31400, 'Mark Feeney', 19, 'Client email 22 Sep', 'Ecophon rafts in lieu of standard tiles'),
    v('V-026', 'gcd', 'Tea point relocation, L4', 'pending', 8900, 12750, 'Mark Feeney', 6, 'Site instruction SI-031', 'Priced, with Lansdowne PM for sign off'),
    v('V-008', 'ifsc', 'Comms room additional cooling', 'approved', 11400, 15900, 'Paddy Brennan', 21, "Architect's instruction 007 from Studio Quay", 'Second split unit and condensate pump'),
    v('V-009', 'ifsc', 'Glass manifestation design change', 'pending', 3100, 4450, 'Paddy Brennan', 8, 'Client brand team email', 'Revised film design, all floors'),
    v('V-005', 'sandyford', 'Additional pressure monitoring points', 'approved', 9800, 13600, 'Aoife Gallagher', 24, 'Delta Process Design RFI-014 response', '4 extra points to BMS'),
    v('V-006', 'sandyford', 'Pass-through hatch upgrade to interlocked type', 'approved', 6200, 8900, 'Aoife Gallagher', 17, 'Corvane QA request', 'Two hatches'),
    v('V-007', 'sandyford', 'Extra HEPA filter housing, room 2.14', 'pending', 7400, 10300, 'Aoife Gallagher', 5, 'Stanmore instruction SI-009', 'With Stanmore for approval'),
    v('V-011', 'manchester', 'Additional power to L6 collaboration zone', 'approved', 21300, 28900, 'Owen Rafferty', 28, "Architect's instruction 011 from Arden Mills", '16 floor boxes and 2 extra circuits'),
    v('V-012', 'manchester', 'Kitchen worktop spec upgrade, L7', 'approved', 8700, 12400, 'Owen Rafferty', 20, 'Client choice, quartz in lieu of laminate', ''),
    v('V-013', 'manchester', 'Additional wayfinding signage package', 'pending', 4200, 6100, 'Owen Rafferty', 9, 'Castlefield PM email', 'With PM'),
    v('V-014', 'manchester', 'Additional fire stopping to riser walls, L7', 'unpriced', 18400, 24600, 'Owen Rafferty', 11, 'Building control visit, verbal', 'Work started on site. Northern Partitions on daywork sheets.'),
    v('V-015', 'manchester', 'Glazed meeting room added, L8 east', 'unpriced', 31200, 41900, 'Owen Rafferty', 7, 'Client instruction on site walk, not yet confirmed in writing', 'Setting out done. Glazing ordered.'),
    v('V-004', 'newcastle', 'Shower block refurbishment, ground floor', 'approved', 16800, 22500, 'Gary Robson', 27, "Architect's instruction 006 from Lumen North", ''),
    v('V-005', 'newcastle', 'Additional bike store lighting', 'pending', 2100, 3000, 'Gary Robson', 4, 'Baltic PM email', ''),
    v('V-003', 'cherrywood', 'Replace rotten timber deck, north roof bay', 'approved', 12600, 17200, 'Shane Kavanagh', 18, 'Tallis Brady inspection note', '46 m2 of decking'),
    v('V-004', 'cherrywood', 'Rooflight upstand repairs', 'pending', 5400, 7600, 'Shane Kavanagh', 3, 'Corrib PM site walk', '6 upstands'),
  ]
}

const AUTH: Record<string, [string, string]> = {
  gcd: ['Mark Feeney', 'Site Manager'],
  ifsc: ['Paddy Brennan', 'Site Manager'],
  sandyford: ['Aoife Gallagher', 'Site Manager'],
  manchester: ['Owen Rafferty', 'Site Manager'],
  newcastle: ['Gary Robson', 'Site Manager'],
  cherrywood: ['Shane Kavanagh', 'Site Manager'],
}

function diary(): DiaryEntry[] {
  let n = 0
  const e = (
    projectId: string,
    when: number,
    text: string,
    area: string,
    trade: string,
    photo?: [string, number],
    author?: [string, string],
  ): DiaryEntry => {
    const [a, r] = author ?? AUTH[projectId]
    return {
      id: `d${++n}`,
      projectId,
      author: a,
      role: r,
      at: when,
      text,
      area,
      trade,
      photo: photo ? { caption: photo[0], tone: photo[1] } : undefined,
    }
  }
  const jw: [string, string] = ['Jamie Walsh', 'Foreman']
  const ke: [string, string] = ['Kerry Ashworth', 'Assistant Site Manager']
  const ld: [string, string] = ['Liam Duffy', 'Site Engineer']
  return [
    // Grand Canal Dock
    e('gcd', ago(14), 'L4 east wing ceiling grid done to gridline 11. Apex start boarding the bulkheads tomorrow.', 'Level 4 east', 'Ceilings', ['Level 4 ceiling grid, east wing', 0]),
    e('gcd', ago(95), 'Fire stopping on L3 risers inspected with Fennell Kerr. Two penetrations to redo at R3, otherwise signed off.', 'Level 3 risers', 'Fire stopping', ['Riser R3 fire stopping, L3', 3]),
    e('gcd', ago(160), 'Toolbox talk on working at height from podiums, 31 attended. Sheet uploaded.', 'Site wide', 'Safety', undefined, jw),
    e('gcd', at(1, '16:20'), 'Raised access floor L5 west half complete. Floorline back Thursday for the rest.', 'Level 5 west', 'Flooring', ['Raised access floor, L5 west', 2]),
    e('gcd', at(1, '11:05'), 'Kilbride finished first fix containment L4. Ready for ceiling close up east side.', 'Level 4', 'M&E', ['Containment above L4 corridor', 1]),
    e('gcd', at(1, '07:40'), 'Delivery of 240 ceiling tiles for L4 checked in, stored in L4 core room.', 'Level 4 core', 'Ceilings', undefined, jw),
    e('gcd', at(2, '15:10'), 'L5 boardroom acoustic rafts setting out marked. Client happy with layout on walk round.', 'Level 5 boardroom', 'Ceilings', ['Boardroom raft setting out, L5', 4]),
    e('gcd', at(3, '09:30'), 'Snag on L3 partition head track, 3 m run not plumb near core. Drywall Dynamics to fix today.', 'Level 3 core', 'Drylining', ['Partition head track, L3 core', 3]),
    e('gcd', at(6, '14:45'), 'Ceiling grid L3 complete and signed off by Apex supervisor.', 'Level 3', 'Ceilings', ['Level 3 ceiling grid, complete', 0]),
    e('gcd', at(8, '08:15'), 'Tea point on L4 moving 2 bays south per SI-031. Variation raised.', 'Level 4 tea point', 'Joinery'),
    e('gcd', at(12, '12:30'), 'Partitions L5 complete. Taping and jointing starts Monday.', 'Level 5', 'Drylining', ['Level 5 partitions complete', 5]),
    e('gcd', at(19, '10:00'), 'Client confirmed acoustic rafts for L5 boardroom. Price agreed, V-024 approved.', 'Level 5 boardroom', 'Ceilings'),
    e('gcd', at(24, '07:55'), 'Crane lift of AHU to roof done before 8. Road closure lifted 07:50.', 'Roof', 'M&E', ['AHU lift to roof', 6]),
    // IFSC
    e('ifsc', ago(38), 'Apex only 3 men in again today. Zone C ceiling grid not started. Kilbride waiting to second fix zone A.', 'Level 2 zone C', 'Ceilings', ['Level 2 zone C, open soffit', 3]),
    e('ifsc', ago(120), 'Comms room containment complete L3. Secure Data in Thursday to start pulling.', 'Level 3 comms room', 'Data', ['Comms room containment, L3', 1]),
    e('ifsc', at(1, '15:30'), 'Ceiling grid L2 zone B finished. Zone C to go. Apex say second gang free next week, not confirmed.', 'Level 2 zone B', 'Ceilings', ['Ceiling grid L2, zone B', 0]),
    e('ifsc', at(1, '08:10'), 'Kilbride stood down 2 men from L2 second fix, no ceilings to work to.', 'Level 2', 'M&E'),
    e('ifsc', at(2, '13:20'), 'Glass partition survey moved to Friday at Studio Quay request.', 'Level 3', 'Glazing'),
    e('ifsc', at(4, '09:00'), 'Apex supervisor on site. Told him we need 6 men minimum. Promised for Monday.', 'Level 2', 'Ceilings'),
    e('ifsc', at(7, '16:00'), 'Partitions complete both floors. Handed over to Apex for ceilings.', 'Levels 2 and 3', 'Drylining', ['Level 3 partitions complete', 5]),
    e('ifsc', at(11, '11:40'), 'Comms room cooling upgrade confirmed, V-008 approved.', 'Level 3 comms room', 'M&E'),
    e('ifsc', at(16, '08:30'), 'Strip out complete L3. Skips off site, waste docket uploaded.', 'Level 3', 'Strip out', ['Level 3 after strip out', 6]),
    // Sandyford
    e('sandyford', ago(25), 'AHU-2 isolated under permit SF-118 and tied in. Permit closed, plant restored 09:20.', 'Plant room', 'HVAC', ['AHU-2 duct tie-in', 1]),
    e('sandyford', ago(140), 'Coving and sealant room 2.14 done. Ready for clean and particle count next week.', 'Room 2.14', 'Cleanroom', ['Cleanroom coving, room 2.14', 4]),
    e('sandyford', at(1, '14:00'), 'Pressure cascade first pass: airlock 1 at 12 Pa, needs 15. Validair rebalancing tomorrow.', 'Airlock 1', 'Commissioning'),
    e('sandyford', at(2, '10:15'), 'Gowning room interlocks wired. Testing with Corvane QA Thursday.', 'Gowning room', 'Electrical', ['Gowning room door interlocks', 2]),
    e('sandyford', at(5, '09:40'), 'Cleanroom wall panels all in. Pureform snag list down to 4 items.', 'Cleanroom suite', 'Cleanroom', ['Cleanroom wall panels, suite 2', 4]),
    e('sandyford', at(9, '15:00'), 'Hot works permit for brazing in plant room, fire watch 60 min after. No issues.', 'Plant room', 'HVAC'),
    e('sandyford', at(14, '08:00'), 'Ceiling grid in support corridor complete. Walkable ceiling in suite on order, 3 weeks.', 'Support corridor', 'Ceilings', ['Ceiling grid, support corridor', 0]),
    e('sandyford', at(21, '11:20'), 'Decommissioning sign off received from Corvane EHS.', 'Lab 1', 'Strip out'),
    // Manchester
    e('manchester', ago(52), 'L8 east glazed meeting room set out on the floor for client. Glazing ordered. Still no written instruction.', 'Level 8 east', 'Glazing', ['Glazed meeting room setting out, L8', 5], ke),
    e('manchester', ago(170), 'L7 ceiling grid 80% complete, north core done to gridline 8.', 'Level 7', 'Ceilings', ['Level 7 ceiling grid, north core', 0]),
    e('manchester', at(1, '15:45'), 'Building control want extra fire stopping on L7 riser walls. Northern Partitions started on daywork. Variation needs pricing.', 'Level 7 risers', 'Fire stopping', ['Riser wall fire stopping, L7', 3]),
    e('manchester', at(1, '09:20'), 'Irwell second fix small power L6 started. Floor boxes per V-011 in.', 'Level 6', 'Electrical', ['L6 collaboration zone floor boxes', 2]),
    e('manchester', at(3, '12:10'), 'Kitchen worktops measured L7. Quartz lead time 3 weeks.', 'Level 7 kitchen', 'Joinery', undefined, ke),
    e('manchester', at(5, '08:40'), 'Northern Partitions extra 2 lads on L6 to recover the bulkhead rework. Costing us.', 'Level 6', 'Drylining'),
    e('manchester', at(10, '14:30'), 'Partitions complete L6 to L8. Building control first visit, fine apart from riser walls.', 'Levels 6 to 8', 'Drylining', ['Level 8 partitions complete', 5]),
    e('manchester', at(18, '07:50'), 'Delivery of 14 pallets plasterboard L7 via goods lift, booked 7 to 8.', 'Loading bay', 'Logistics', ['Board delivery, goods lift', 6]),
    // Newcastle
    e('newcastle', ago(70), 'Snag walk L2 with Baltic PM done. 11 new items added, mostly decoration.', 'Level 2', 'Snagging', ['Snag walk, L2 open plan', 5]),
    e('newcastle', at(1, '15:00'), 'Ceiling grid tiles damaged in reception by M&E access. 6 tiles to replace, snag raised.', 'Reception', 'Ceilings', ['Reception ceiling, damaged tiles', 3]),
    e('newcastle', at(1, '10:30'), 'Genie lift not used since last week. Can go back.', 'Level 1', 'Plant'),
    e('newcastle', at(3, '13:20'), 'Commissioning certs for mechanical received. Electrical due Friday.', 'Plant room', 'M&E'),
    e('newcastle', at(6, '09:10'), 'Final clean booked for week of handover.', 'Site wide', 'Cleaning'),
    e('newcastle', at(13, '16:00'), 'Carpet complete all floors.', 'Levels 1 and 2', 'Flooring', ['Carpet tiles L2', 2]),
    // Cherrywood
    e('cherrywood', ago(30), 'VCL down on bay 5. Membrane crew pushing to finish before the wind picks up at 2.', 'Roof bay 5', 'Roofing', ['Roof bay 5, VCL laid', 6], ld),
    e('cherrywood', ago(200), 'Roof access permit RA-044 issued to Summit. Edge protection checked on east side.', 'Roof east', 'Safety'),
    e('cherrywood', at(1, '14:20'), 'Stood down the boom at 13:50, gusts 40 km/h. Back up this morning.', 'East elevation', 'Facade'),
    e('cherrywood', at(2, '11:00'), 'Bay 4 membrane complete and flood tested. No leaks.', 'Roof bay 4', 'Roofing', ['Flood test, bay 4', 1]),
    e('cherrywood', at(4, '08:30'), 'Tenant on level 2 asked for quiet works 10 to 12 Wednesday. Agreed, noisy work moved to afternoon.', 'Level 2 tenant', 'Logistics'),
    e('cherrywood', at(9, '10:40'), 'Rotten deck in north bay worse than surveyed. Tallis Brady inspected, V-003 approved.', 'North bay', 'Roofing', ['Rotten deck, north bay', 3]),
    e('cherrywood', at(20, '09:00'), 'Scaffold handed over with scafftag, inspected by Shane.', 'Scaffold', 'Scaffold', ['Scaffold, east elevation', 4]),
  ]
}

function rfis(): Rfi[] {
  const r = (projectId: string, ref: string, title: string, to: string, daysAgo: number, status: Rfi['status']): Rfi => ({
    id: `${projectId}-${ref}`,
    projectId,
    ref,
    title,
    to,
    daysAgo,
    status,
  })
  return [
    r('gcd', 'RFI-041', 'Confirm finish to L4 tea point splashback', 'Fennell Kerr', 3, 'open'),
    r('gcd', 'RFI-039', 'Boardroom raft fixing detail to slab', 'Fennell Kerr', 9, 'answered'),
    r('ifsc', 'RFI-022', 'Ceiling void depth at zone C bulkhead clashes with ductwork', 'Studio Quay', 8, 'overdue'),
    r('ifsc', 'RFI-023', 'Glass partition door hardware schedule', 'Studio Quay', 4, 'open'),
    r('sandyford', 'RFI-017', 'Pressure differential target for airlock 2', 'Delta Process Design', 2, 'open'),
    r('manchester', 'RFI-028', 'Fire stopping specification to L7 riser walls', 'Arden Mills', 6, 'open'),
    r('manchester', 'RFI-029', 'L8 glazed meeting room, door type and manifestation', 'Arden Mills', 5, 'open'),
    r('newcastle', 'RFI-019', 'O&M format required by Tyne Mutual FM', 'Baltic PM', 7, 'answered'),
    r('cherrywood', 'RFI-011', 'Curtain wall bracket fixing into existing slab edge', 'Tallis Brady', 5, 'open'),
  ]
}

function snags(): Snag[] {
  const out: Snag[] = []
  let n = 200
  const locs = ['L1 open plan', 'L1 meeting room 1.04', 'L2 open plan', 'L2 kitchen', 'Reception', 'Lift lobby L1', 'Lift lobby L2', 'WC core L1', 'WC core L2', 'Stair core A', 'Comms room', 'L2 meeting room 2.03']
  const defects: [string, string, string][] = [
    ['Paint touch up to door frame', 'Decoration', 'Tyne Decorators'],
    ['Skirting gap at corner, re-seal', 'Joinery', 'Northern Partitions'],
    ['Ceiling tile stained, replace', 'Ceilings', 'Northern Partitions'],
    ['Light fitting not working', 'Electrical', 'Irwell Electrical'],
    ['Door closer adjust, slamming', 'Ironmongery', 'Roccul UK'],
    ['Scuff to wall, make good and paint', 'Decoration', 'Tyne Decorators'],
    ['Floor box lid missing', 'Electrical', 'Irwell Electrical'],
    ['Carpet tile lifting at threshold', 'Flooring', 'Roccul UK'],
    ['Mastic to WC splashback incomplete', 'Joinery', 'Northern Partitions'],
    ['Signage missing to fire door', 'Signage', 'Roccul UK'],
  ]
  for (let i = 0; i < 38; i++) {
    const d = defects[(i * 7) % defects.length]
    out.push({
      id: `sn${++n}`,
      projectId: 'newcastle',
      ref: `SN-${n}`,
      location: locs[(i * 5) % locs.length],
      text: d[0],
      trade: d[1],
      assignee: d[2],
      status: 'open',
      daysAgo: (i % 9) + 1,
    })
  }
  const few: [string, string, string, string, string][] = [
    ['gcd', 'L3 core', 'Partition head track not plumb, 3 m run', 'Drylining', 'Drywall Dynamics'],
    ['gcd', 'L3 riser R3', 'Two penetrations to redo fire stopping', 'Fire stopping', 'Kilbride M&E'],
    ['gcd', 'L5 west', 'Floor tile chipped at door threshold', 'Flooring', 'Floorline Contracts'],
    ['ifsc', 'L3 comms room', 'Containment lid missing at entry', 'M&E', 'Kilbride M&E'],
    ['ifsc', 'L2 stair core', 'Damaged plasterboard corner', 'Drylining', 'Drywall Dynamics'],
    ['sandyford', 'Room 2.14', 'Sealant bead uneven at coving', 'Cleanroom', 'Pureform Panels'],
    ['sandyford', 'Airlock 1', 'Door seal not compressing at head', 'Cleanroom', 'Pureform Panels'],
    ['manchester', 'L6 east', 'Bulkhead line wavy over desk bank', 'Drylining', 'Northern Partitions'],
    ['manchester', 'L7 kitchen', 'Wall tile setting out off centre', 'Finishes', 'Roccul UK'],
    ['cherrywood', 'Roof bay 3', 'Membrane lap not sealed at upstand', 'Roofing', 'Summit Roofing'],
  ]
  few.forEach((f, i) =>
    out.push({
      id: `sn${++n}`,
      projectId: f[0],
      ref: `SN-${n}`,
      location: f[1],
      text: f[2],
      trade: f[3],
      assignee: f[4],
      status: 'open',
      daysAgo: (i % 5) + 1,
    }),
  )
  out.push(
    { id: `sn${++n}`, projectId: 'newcastle', ref: `SN-${n}`, location: 'L1 open plan', text: 'Blind cord safety cleat missing', trade: 'Finishes', assignee: 'Roccul UK', status: 'closed', daysAgo: 6 },
    { id: `sn${++n}`, projectId: 'newcastle', ref: `SN-${n}`, location: 'Reception', text: 'Reception desk edging lifted', trade: 'Joinery', assignee: 'Northern Partitions', status: 'closed', daysAgo: 8 },
  )
  return out
}

function permits(): Permit[] {
  const p = (projectId: string, ref: string, type: string, area: string, issuedTo: string, expires: string, status: Permit['status']): Permit => ({
    id: `${projectId}-${ref}`,
    projectId,
    ref,
    type,
    area,
    issuedTo,
    expires,
    status,
  })
  return [
    p('gcd', 'GC-212', 'Hot works', 'L4 riser R2', 'Kilbride M&E', 'Today 16:00', 'live'),
    p('gcd', 'GC-213', 'Working at height', 'L5 atrium edge', 'Apex Ceilings', 'Today 17:30', 'live'),
    p('ifsc', 'IF-088', 'Electrical isolation', 'L3 DB-3B', 'Kilbride M&E', 'Today 12:00', 'expiring'),
    p('sandyford', 'SF-118', 'Isolation, AHU-2', 'Plant room', 'Kilbride M&E', 'Closed 09:20', 'closed'),
    p('sandyford', 'SF-119', 'Cleanroom entry', 'Suite 2', 'Validair', 'Today 18:00', 'live'),
    p('sandyford', 'SF-120', 'Hot works', 'Plant room', 'Kilbride M&E', 'Today 15:00', 'live'),
    p('sandyford', 'SF-121', 'Lock out tag out, chilled water', 'Plant room', 'Kilbride M&E', 'Today 17:00', 'live'),
    p('sandyford', 'SF-122', 'Working at height', 'Support corridor', 'Pureform Panels', 'Today 17:00', 'live'),
    p('sandyford', 'SF-123', 'Confined space, ceiling void', 'Suite 1', 'Kilbride M&E', 'Today 11:30', 'expiring'),
    p('sandyford', 'SF-124', 'Electrical isolation', 'DB-L1', 'Kilbride M&E', 'Today 16:30', 'live'),
    p('sandyford', 'SF-125', 'Cleanroom entry', 'Suite 1', 'Pureform Panels', 'Today 18:00', 'live'),
    p('sandyford', 'SF-126', 'Fire alarm isolation, zone 4', 'Level 1', 'Roccul', 'Today 17:00', 'live'),
    p('sandyford', 'SF-127', 'Drilling into live services zone', 'Lab 1', 'Kilbride M&E', 'Today 14:00', 'live'),
    p('manchester', 'SP-064', 'Hot works', 'L7 riser', 'Northern Partitions', 'Today 16:00', 'live'),
    p('cherrywood', 'RA-044', 'Roof access', 'Roof east', 'Summit Roofing', 'Today 14:00', 'expiring'),
    p('cherrywood', 'RA-045', 'Hot works, torch on', 'Roof bay 5', 'Summit Roofing', 'Today 14:00', 'expiring'),
    p('cherrywood', 'MW-012', 'MEWP operation', 'East elevation', 'Clearview Glazing', 'Today 17:00', 'live'),
  ]
}

function subbies(): Subbie[] {
  return [
    { id: 's1', name: 'Apex Ceilings Ltd', trade: 'Ceilings', projects: ['gcd', 'ifsc'], rams: 'ok', ramsNote: 'Rev 3, approved 2 Sep', insurance: 'ok', insuranceNote: 'Valid to Mar', blocked: false, onSiteToday: 9 },
    { id: 's2', name: 'Kilbride M&E', trade: 'Mechanical and electrical', projects: ['gcd', 'ifsc', 'sandyford'], rams: 'ok', ramsNote: 'Rev 5, approved 18 Sep', insurance: 'ok', insuranceNote: 'Valid to Jun', blocked: false, onSiteToday: 25 },
    { id: 's3', name: 'Drywall Dynamics', trade: 'Drylining', projects: ['gcd', 'ifsc'], rams: 'ok', ramsNote: 'Rev 2', insurance: 'ok', insuranceNote: 'Valid to Jan', blocked: false, onSiteToday: 10 },
    { id: 's4', name: 'Pureform Panels', trade: 'Cleanroom panels', projects: ['sandyford'], rams: 'ok', ramsNote: 'Rev 4, critical environment addendum', insurance: 'ok', insuranceNote: 'Valid to Apr', blocked: false, onSiteToday: 4 },
    { id: 's5', name: 'Summit Roofing', trade: 'Roofing', projects: ['cherrywood'], rams: 'expiring', ramsNote: 'Hot works RAMS review due in 5 days', insurance: 'ok', insuranceNote: 'Valid to Feb', blocked: false, onSiteToday: 6 },
    { id: 's6', name: 'Clearview Glazing', trade: 'Facade', projects: ['cherrywood'], rams: 'ok', ramsNote: 'Rev 1', insurance: 'expiring', insuranceNote: 'Expires in 12 days', blocked: false, onSiteToday: 3 },
    { id: 's7', name: 'Kelvin Scaffolding Ltd', trade: 'Scaffolding', projects: ['cherrywood', 'manchester'], rams: 'ok', ramsNote: 'Rev 2', insurance: 'expired', insuranceNote: 'Employers liability expired 3 days ago', blocked: true, onSiteToday: 0 },
    { id: 's8', name: 'Northern Partitions', trade: 'Drylining', projects: ['manchester', 'newcastle'], rams: 'ok', ramsNote: 'Rev 3', insurance: 'ok', insuranceNote: 'Valid to May', blocked: false, onSiteToday: 12 },
    { id: 's9', name: 'Irwell Electrical', trade: 'Electrical', projects: ['manchester', 'newcastle'], rams: 'review', ramsNote: 'Rev 2 submitted, awaiting Declan', insurance: 'ok', insuranceNote: 'Valid to Aug', blocked: false, onSiteToday: 10 },
    { id: 's10', name: 'Floorline Contracts', trade: 'Flooring', projects: ['gcd'], rams: 'ok', ramsNote: 'Rev 1', insurance: 'ok', insuranceNote: 'Valid to Dec', blocked: false, onSiteToday: 4 },
    { id: 's11', name: 'Tyne Decorators', trade: 'Decoration', projects: ['newcastle'], rams: 'ok', ramsNote: 'Rev 1', insurance: 'ok', insuranceNote: 'Valid to Jul', blocked: false, onSiteToday: 4 },
    { id: 's12', name: 'Pennine Ceilings', trade: 'Ceilings', projects: ['manchester'], rams: 'ok', ramsNote: 'Rev 2', insurance: 'ok', insuranceNote: 'Valid to Mar', blocked: false, onSiteToday: 5 },
  ]
}

function toolbox(): Toolbox[] {
  return [
    { id: 't1', projectId: 'gcd', topic: 'Working at height from podiums', by: 'Jamie Walsh', daysAgo: 0, attendees: 31 },
    { id: 't2', projectId: 'sandyford', topic: 'Permit discipline in live plant rooms', by: 'Aoife Gallagher', daysAgo: 1, attendees: 15 },
    { id: 't3', projectId: 'cherrywood', topic: 'Wind speed limits for MEWPs', by: 'Shane Kavanagh', daysAgo: 1, attendees: 11 },
    { id: 't4', projectId: 'manchester', topic: 'Fire stopping and penetrations', by: 'Owen Rafferty', daysAgo: 2, attendees: 26 },
    { id: 't5', projectId: 'ifsc', topic: 'Manual handling of ceiling tiles', by: 'Paddy Brennan', daysAgo: 2, attendees: 18 },
    { id: 't6', projectId: 'newcastle', topic: 'Housekeeping before handover', by: 'Gary Robson', daysAgo: 3, attendees: 13 },
  ]
}

function nearMisses(): NearMiss[] {
  return [
    { id: 'nm1', projectId: 'cherrywood', text: 'Insulation board lifted by gust on roof bay 5, landed inside edge protection.', daysAgo: 1, action: 'Boards now weighted and cut to size at ground level.', closed: false },
    { id: 'nm2', projectId: 'gcd', text: 'Podium left with brakes off on L4 corridor, it rolled when stepped on.', daysAgo: 3, action: 'Toolbox talk held. Podium checks added to daily brief.', closed: true },
    { id: 'nm3', projectId: 'manchester', text: 'Board trolley tipped in goods lift on uneven threshold.', daysAgo: 5, action: 'Threshold ramp fitted, lift banksman at deliveries.', closed: true },
    { id: 'nm4', projectId: 'sandyford', text: 'Operative entered plant room without signing onto isolation permit.', daysAgo: 8, action: 'Re-briefed, permit board moved to plant room door.', closed: true },
  ]
}

function nominees(): Nominee[] {
  return [
    { id: 'n1', name: 'Jamie Walsh', role: 'Foreman, Grand Canal Dock', projectId: 'gcd', reason: 'Stopped work on an unsecured podium and ran a toolbox talk the same morning.', votes: 4 },
    { id: 'n2', name: 'Aoife Gallagher', role: 'Site Manager, Sandyford', projectId: 'sandyford', reason: '9 live permits a day and not one missed sign off this month.', votes: 6 },
    { id: 'n3', name: 'Liam Duffy', role: 'Site Engineer, Cherrywood', projectId: 'cherrywood', reason: 'Called the boom down before the gusts hit. Kept the tenants informed.', votes: 3 },
    { id: 'n4', name: 'Kerry Ashworth', role: 'Assistant Site Manager, Manchester', projectId: 'manchester', reason: 'Fixed the goods lift threshold after the trolley near miss.', votes: 2 },
    { id: 'n5', name: 'Gary Robson', role: 'Site Manager, Newcastle', projectId: 'newcastle', reason: 'Clean, tidy site in the last weeks before handover.', votes: 1 },
  ]
}

function resources(): Resource[] {
  return [
    { id: 'c1', kind: 'crew', name: 'Roccul carpenters, gang A', short: 'Carps A', detail: '4 operatives', size: 4 },
    { id: 'c2', kind: 'crew', name: 'Roccul carpenters, gang B', short: 'Carps B', detail: '3 operatives', size: 3 },
    { id: 'c3', kind: 'crew', name: 'Apex Ceilings, gang 1', short: 'Apex', detail: '6 operatives', size: 6 },
    { id: 'c4', kind: 'crew', name: 'Kilbride M&E', short: 'Kilbride', detail: '8 operatives', size: 8 },
    { id: 'c5', kind: 'crew', name: 'Drywall Dynamics', short: 'Drywall', detail: '5 operatives', size: 5 },
    { id: 'c6', kind: 'crew', name: 'Pureform Panels', short: 'Pureform', detail: '4 operatives', size: 4 },
    { id: 'c7', kind: 'crew', name: 'Summit Roofing', short: 'Summit', detail: '6 operatives', size: 6 },
    { id: 'c8', kind: 'crew', name: 'Northern Partitions', short: 'Northern', detail: '8 operatives', size: 8 },
    { id: 'c9', kind: 'crew', name: 'Roccul UK snagging gang', short: 'Snag gang', detail: '3 operatives', size: 3 },
    { id: 'p1', kind: 'plant', name: 'Scissor lift SL-04, Genie GS-1932', short: 'Scissor SL-04', detail: 'GS-1932, 7.6 m', rate: 285, currency: 'EUR', supplier: 'Hewden Hire Dublin', onHire: true, idleDays: 0 },
    { id: 'p2', kind: 'plant', name: 'Scissor lift SL-07, Genie GS-2632', short: 'Scissor SL-07', detail: 'GS-2632, 9.8 m', rate: 340, currency: 'EUR', supplier: 'Hewden Hire Dublin', onHire: true, idleDays: 0 },
    { id: 'p3', kind: 'plant', name: 'Genie lift SL-11, GS-1932', short: 'Genie SL-11', detail: 'GS-1932, 7.6 m', rate: 412, currency: 'GBP', supplier: 'North East Access Hire', onHire: true, idleDays: 9 },
    { id: 'p4', kind: 'plant', name: 'Boom lift BL-01, Genie Z-45', short: 'Boom BL-01', detail: 'Z-45, 15.9 m', rate: 690, currency: 'EUR', supplier: 'Access Platforms Ireland', onHire: true, idleDays: 0 },
    { id: 'p5', kind: 'plant', name: 'Telehandler TH-02, JCB 535-95', short: 'Telehandler', detail: 'JCB 535-95', rate: 820, currency: 'EUR', supplier: 'Lynch Plant Hire', onHire: true, idleDays: 0 },
    { id: 'p6', kind: 'plant', name: 'Scissor lift SL-09, Skyjack 3219', short: 'Scissor SL-09', detail: 'Skyjack 3219', rate: 265, currency: 'GBP', supplier: 'Speedy Hire Manchester', onHire: true, idleDays: 2 },
  ]
}

function bookings(): Booking[] {
  const plan: [string, string, number[]][] = [
    ['c1', 'gcd', [0, 1, 2, 3, 4]],
    ['c2', 'ifsc', [0, 1, 2]],
    ['c2', 'gcd', [3, 4]],
    ['c3', 'gcd', [0, 1, 2, 3, 4]],
    ['c4', 'ifsc', [0, 1, 2, 3, 4]],
    ['c5', 'gcd', [0, 1]],
    ['c5', 'ifsc', [2, 3, 4]],
    ['c6', 'sandyford', [0, 1, 2, 3, 4]],
    ['c7', 'cherrywood', [0, 1, 2, 3, 4]],
    ['c8', 'manchester', [0, 1, 2, 3, 4]],
    ['c9', 'newcastle', [0, 1, 2, 3, 4]],
    ['p1', 'gcd', [0, 1, 2, 3, 4]],
    ['p2', 'gcd', [0, 1, 2, 3]],
    ['p2', 'ifsc', [3]],
    ['p3', 'newcastle', [0, 1, 2, 3, 4]],
    ['p4', 'cherrywood', [0, 1, 2, 3, 4]],
    ['p5', 'cherrywood', [3]],
    ['p6', 'manchester', [0, 1, 2, 3, 4]],
  ]
  const out: Booking[] = []
  let n = 0
  for (const [r, p, days] of plan) for (const d of days) out.push({ id: `b${++n}`, resourceId: r, projectId: p, day: d })
  return out
}

function docs(): Doc[] {
  const sets: Record<string, [string, Doc['kind'], string, number, string][]> = {
    gcd: [
      ['Programme Rev 6, floors 3 to 5', 'Programme', 'Rev 6', 4, 'Ciara Doyle'],
      ['A-204 Reflected ceiling plan L4', 'Drawing', 'Rev D', 9, 'Fennell Kerr'],
      ['A-210 Tea point layout L4 (SI-031)', 'Drawing', 'Rev B', 7, 'Fennell Kerr'],
      ['RAMS Apex Ceilings, ceiling installation', 'RAMS', 'Rev 3', 31, 'Apex Ceilings'],
      ['Fire stopping schedule L3 to L5', 'Spec', 'Rev 2', 12, 'Kilbride M&E'],
      ['Progress meeting 13 minutes', 'Minutes', 'Final', 6, 'Lansdowne PM'],
    ],
    ifsc: [
      ['Programme Rev 4 with ceiling recovery', 'Programme', 'Rev 4', 2, 'Ciara Doyle'],
      ['A-110 Ceiling layout L2', 'Drawing', 'Rev C', 14, 'Studio Quay'],
      ['RAMS Kilbride second fix', 'RAMS', 'Rev 5', 22, 'Kilbride M&E'],
      ['Progress meeting 8 minutes', 'Minutes', 'Final', 5, 'Carrick Project Partners'],
    ],
    sandyford: [
      ['URS cleanroom suite 2', 'Spec', 'Rev 1', 60, 'Corvane Biologics'],
      ['Permit register, week 11', 'Certificate', 'Live', 0, 'Aoife Gallagher'],
      ['M-301 HVAC schematic AHU-2', 'Drawing', 'Rev E', 18, 'Delta Process Design'],
      ['RAMS Pureform cleanroom panels', 'RAMS', 'Rev 4', 40, 'Pureform Panels'],
    ],
    manchester: [
      ['Programme Rev 5, floors 6 to 8', 'Programme', 'Rev 5', 6, 'Tom Hartley'],
      ['A-801 L8 general arrangement', 'Drawing', 'Rev F', 10, 'Arden Mills'],
      ['Building control visit note, L7 risers', 'Minutes', 'Draft', 2, 'Owen Rafferty'],
      ['Daywork sheets Northern Partitions wk 11', 'Certificate', 'Signed', 3, 'Owen Rafferty'],
    ],
    newcastle: [
      ['Snag list Rev 3', 'Spec', 'Rev 3', 1, 'Gary Robson'],
      ['O&M manual draft', 'O&M', 'Draft', 2, 'Gary Robson'],
      ['Mechanical commissioning certificates', 'Certificate', 'Final', 3, 'Irwell Electrical'],
      ['Handover plan', 'Programme', 'Rev 2', 5, 'Tom Hartley'],
    ],
    cherrywood: [
      ['Programme Rev 3 with weather days', 'Programme', 'Rev 3', 8, 'Ciara Doyle'],
      ['R-101 Roof plan and bays', 'Drawing', 'Rev C', 25, 'Tallis Brady'],
      ['Tenant liaison plan', 'Spec', 'Rev 2', 12, 'Shane Kavanagh'],
      ['RAMS Summit torch on membrane', 'RAMS', 'Rev 2', 26, 'Summit Roofing'],
      ['Scaffold handover certificate', 'Certificate', 'Final', 20, 'Kelvin Scaffolding'],
    ],
  }
  const out: Doc[] = []
  for (const [pid, list] of Object.entries(sets))
    list.forEach((d, i) => out.push({ id: `${pid}-doc${i}`, projectId: pid, name: d[0], kind: d[1], rev: d[2], daysAgo: d[3], by: d[4] }))
  return out
}

function valuations(): Valuation[] {
  return [
    { projectId: 'gcd', number: 6, applied: 2_284_000, certified: 2_241_500, retention: 5, due: '25 Oct', status: 'certified' },
    { projectId: 'ifsc', number: 4, applied: 1_096_000, certified: 1_052_300, retention: 5, due: '25 Oct', status: 'certified' },
    { projectId: 'sandyford', number: 5, applied: 948_000, certified: 931_200, retention: 3, due: '28 Oct', status: 'submitted' },
    { projectId: 'manchester', number: 5, applied: 1_712_000, certified: 1_640_800, retention: 3, due: '24 Oct', status: 'draft' },
    { projectId: 'newcastle', number: 7, applied: 1_081_000, certified: 1_062_400, retention: 3, due: '24 Oct', status: 'certified' },
    { projectId: 'cherrywood', number: 3, applied: 528_000, certified: 509_700, retention: 5, due: '30 Oct', status: 'draft' },
  ]
}

function approvals(): Approval[] {
  return [
    { id: 'a1', projectId: 'gcd', kind: 'Variation', title: 'V-026 Tea point relocation, L4. Issue to client at €12,750', from: 'Mark Feeney', amount: 12750, daysAgo: 1, state: 'waiting' },
    { id: 'a2', projectId: 'ifsc', kind: 'Overtime', title: 'Saturday working, Apex Ceilings, 6 men, L2 zone C', from: 'Paddy Brennan', amount: 4800, daysAgo: 0, state: 'waiting' },
    { id: 'a3', projectId: 'cherrywood', kind: 'RAMS', title: 'Summit Roofing torch on RAMS Rev 3', from: 'Shane Kavanagh', daysAgo: 1, state: 'waiting' },
    { id: 'a4', projectId: 'sandyford', kind: 'Purchase order', title: 'Validair particle count validation, PO 4471', from: 'Aoife Gallagher', amount: 8600, daysAgo: 2, state: 'waiting' },
    { id: 'a5', projectId: 'cherrywood', kind: 'Plant hire', title: 'Extend boom lift BL-01 by 2 weeks', from: 'Shane Kavanagh', amount: 1380, daysAgo: 0, state: 'waiting' },
  ]
}

function feed(): FeedItem[] {
  const f = (projectId: string, kind: FeedItem['kind'], actor: string, text: string, mins: number, photo?: [string, number]): FeedItem => ({
    id: `f${projectId}${mins}`,
    projectId,
    kind,
    actor,
    text,
    at: ago(mins),
    photo: photo ? { caption: photo[0], tone: photo[1] } : undefined,
  })
  return [
    f('gcd', 'photo', 'Mark Feeney', 'Posted a photo: Level 4 ceiling grid, east wing', 2, ['Level 4 ceiling grid, east wing', 0]),
    f('sandyford', 'permit', 'Aoife Gallagher', 'Closed permit SF-118, AHU-2 isolation', 9),
    f('cherrywood', 'photo', 'Liam Duffy', 'Posted a photo: Roof bay 5, VCL laid', 16, ['Roof bay 5, VCL laid', 6]),
    f('ifsc', 'signin', 'Paddy Brennan', 'Apex Ceilings signed in 3 operatives (6 planned)', 31),
    f('manchester', 'delivery', 'Kerry Ashworth', 'Delivery received: 2 pallets fire board, L7', 44),
    f('newcastle', 'snag', 'Gary Robson', '11 snags added after L2 walk with Baltic PM', 58),
    f('gcd', 'toolbox', 'Jamie Walsh', 'Toolbox talk done: working at height from podiums, 31 signed', 74),
    f('manchester', 'signin', 'Owen Rafferty', '29 signed in across L6 to L8', 92),
    f('sandyford', 'signin', 'Aoife Gallagher', '16 signed in, 4 critical environment inductions valid', 105),
    f('cherrywood', 'safety', 'Shane Kavanagh', 'Wind watch set, boom down above 38 km/h', 118),
  ]
}

export const livePool: Omit<FeedItem, 'id' | 'at'>[] = [
  { projectId: 'sandyford', kind: 'signin', actor: 'Aoife Gallagher', text: 'Validair signed in 2 commissioning engineers' },
  { projectId: 'gcd', kind: 'photo', actor: 'Jamie Walsh', text: 'Posted a photo: L5 raised floor, west half', photo: { caption: 'L5 raised access floor, west', tone: 2 } },
  { projectId: 'cherrywood', kind: 'permit', actor: 'Shane Kavanagh', text: 'Closed permit RA-045, torch on bay 5 complete' },
  { projectId: 'manchester', kind: 'delivery', actor: 'Kerry Ashworth', text: 'Delivery received: glazing frames for L8 meeting room' },
  { projectId: 'ifsc', kind: 'rfi', actor: 'Paddy Brennan', text: 'Studio Quay answered RFI-023, door hardware schedule' },
  { projectId: 'newcastle', kind: 'snag', actor: 'Gary Robson', text: 'Closed 4 snags in reception and lift lobby' },
  { projectId: 'gcd', kind: 'inspection', actor: 'Mark Feeney', text: 'Fennell Kerr signed off L4 east ceiling void before close up' },
  { projectId: 'sandyford', kind: 'permit', actor: 'Aoife Gallagher', text: 'Issued hot works permit SF-128, plant room' },
  { projectId: 'cherrywood', kind: 'photo', actor: 'Liam Duffy', text: 'Posted a photo: Membrane laps, bay 5', photo: { caption: 'Membrane laps, roof bay 5', tone: 6 } },
  { projectId: 'manchester', kind: 'signin', actor: 'Owen Rafferty', text: 'Pennine Ceilings signed in 2 more for L7 grid' },
  { projectId: 'ifsc', kind: 'signin', actor: 'Paddy Brennan', text: 'Secure Data Cabling signed in 2 for comms room' },
  { projectId: 'gcd', kind: 'delivery', actor: 'Jamie Walsh', text: 'Delivery received: L4 tea point carcasses' },
  { projectId: 'newcastle', kind: 'photo', actor: 'Gary Robson', text: 'Posted a photo: Reception ceiling, tiles replaced', photo: { caption: 'Reception ceiling, tiles replaced', tone: 0 } },
  { projectId: 'sandyford', kind: 'inspection', actor: 'Aoife Gallagher', text: 'Airlock 1 now holding 15 Pa after rebalance' },
  { projectId: 'cherrywood', kind: 'safety', actor: 'Shane Kavanagh', text: 'Gusts at 36 km/h, boom still in limits' },
  { projectId: 'manchester', kind: 'toolbox', actor: 'Kerry Ashworth', text: 'Toolbox talk done: goods lift loading, 14 signed' },
  { projectId: 'gcd', kind: 'signin', actor: 'Mark Feeney', text: 'Floorline signed in 4 for L5 raised floor' },
  { projectId: 'ifsc', kind: 'photo', actor: 'Paddy Brennan', text: 'Posted a photo: L3 comms room cable tray', photo: { caption: 'Comms room cable tray, L3', tone: 1 } },
]

export interface Seed {
  projects: Project[]
  variations: Variation[]
  diary: DiaryEntry[]
  rfis: Rfi[]
  snags: Snag[]
  permits: Permit[]
  subbies: Subbie[]
  toolbox: Toolbox[]
  nearMisses: NearMiss[]
  nominees: Nominee[]
  resources: Resource[]
  bookings: Booking[]
  docs: Doc[]
  valuations: Valuation[]
  approvals: Approval[]
  feed: FeedItem[]
}

export function makeSeed(): Seed {
  return {
    projects: projects(),
    variations: variations(),
    diary: diary(),
    rfis: rfis(),
    snags: snags(),
    permits: permits(),
    subbies: subbies(),
    toolbox: toolbox(),
    nearMisses: nearMisses(),
    nominees: nominees(),
    resources: resources(),
    bookings: bookings(),
    docs: docs(),
    valuations: valuations(),
    approvals: approvals(),
    feed: feed(),
  }
}

export const siteCode: Record<string, string> = {
  gcd: 'GCD',
  ifsc: 'IFSC',
  sandyford: 'SFD',
  manchester: 'MCR',
  newcastle: 'NCL',
  cherrywood: 'CHW',
}
