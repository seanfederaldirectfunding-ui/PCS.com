"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Gift, Landmark, Plus, ExternalLink, Trash2, TrendingUp } from "lucide-react"

interface FundingResource {
  id: string
  name: string
  url: string
  category: "mca" | "crowdfunding" | "donors" | "grants" | "vc"
  notes?: string
}

export function FundingResources() {
  const [resources, setResources] = useState<FundingResource[]>([
    { id: "1", name: "Daily Funder", url: "https://dailyfunder.com", category: "mca", notes: "MCA marketplace" },
    { id: "2", name: "deBanked", url: "https://debanked.com", category: "mca", notes: "Industry news & leads" },
    {
      id: "mca3",
      name: "CAN Capital",
      url: "https://www.cancapital.com/",
      category: "mca",
      notes: "Business financing and merchant cash advances",
    },
    {
      id: "mca4",
      name: "Credibly",
      url: "https://www.credibly.com/",
      category: "mca",
      notes: "Small business loans and cash advances",
    },
    {
      id: "mca5",
      name: "Elevate Funding",
      url: "https://elevatefunding.com/",
      category: "mca",
      notes: "Fast business funding solutions",
    },
    {
      id: "mca6",
      name: "Fora Financial",
      url: "https://www.forafinancial.com/",
      category: "mca",
      notes: "Working capital for small businesses",
    },
    {
      id: "mca7",
      name: "Forward Financing",
      url: "https://www.forwardfinancing.com/",
      category: "mca",
      notes: "Revenue-based business financing",
    },
    {
      id: "mca8",
      name: "FundKite",
      url: "https://fundkite.com/",
      category: "mca",
      notes: "Quick business cash advances",
    },
    {
      id: "mca9",
      name: "IOU Financial",
      url: "https://ioufinancial.com/",
      category: "mca",
      notes: "Small business loans and lines of credit",
    },
    {
      id: "mca10",
      name: "Kapitus",
      url: "https://kapitus.com/",
      category: "mca",
      notes: "Business financing and equipment leasing",
    },
    {
      id: "mca11",
      name: "Lendio",
      url: "https://www.lendio.com/",
      category: "mca",
      notes: "Small business loan marketplace",
    },
    {
      id: "mca12",
      name: "Libertas Funding",
      url: "https://libertasfunding.com/",
      category: "mca",
      notes: "Alternative business financing",
    },
    {
      id: "mca13",
      name: "Mr Advance",
      url: "https://mradvance.com/",
      category: "mca",
      notes: "Merchant cash advance provider",
    },
    {
      id: "mca14",
      name: "National Funding",
      url: "https://www.nationalfunding.com/",
      category: "mca",
      notes: "Business loans and equipment financing",
    },
    {
      id: "mca15",
      name: "New Chance Capital",
      url: "https://newchancecapital.com/",
      category: "mca",
      notes: "Business funding for all credit types",
    },
    {
      id: "mca16",
      name: "Nulook Capital",
      url: "https://nulookcapital.com/",
      category: "mca",
      notes: "Fast approval business financing",
    },
    {
      id: "mca17",
      name: "OnDeck",
      url: "https://www.ondeck.com/",
      category: "mca",
      notes: "Online small business loans",
    },
    {
      id: "mca18",
      name: "PayPal Working Capital",
      url: "https://www.paypal.com/us/business/funding/working-capital",
      category: "mca",
      notes: "Business loans for PayPal merchants",
    },
    {
      id: "mca19",
      name: "Rapid Finance",
      url: "https://www.rapidfinance.com/",
      category: "mca",
      notes: "Revenue-based business financing",
    },
    {
      id: "mca20",
      name: "Reliant Funding",
      url: "https://www.reliantfunding.com/",
      category: "mca",
      notes: "Small business funding solutions",
    },
    {
      id: "mca21",
      name: "Shopify Capital",
      url: "https://www.shopify.com/capital",
      category: "mca",
      notes: "Funding for Shopify merchants",
    },
    {
      id: "mca22",
      name: "Square Loans",
      url: "https://squareup.com/us/en/capital",
      category: "mca",
      notes: "Business loans for Square sellers",
    },
    {
      id: "mca23",
      name: "Stripe Capital",
      url: "https://stripe.com/capital",
      category: "mca",
      notes: "Financing for Stripe businesses",
    },
    {
      id: "mca24",
      name: "Bluevine",
      url: "https://www.bluevine.com/",
      category: "mca",
      notes: "Lines of credit and invoice factoring",
    },
    {
      id: "mca25",
      name: "Funding Circle",
      url: "https://www.fundingcircle.com/us/",
      category: "mca",
      notes: "Small business loans up to $500K",
    },
    {
      id: "mca26",
      name: "Kabbage",
      url: "https://www.kabbage.com/",
      category: "mca",
      notes: "American Express business line of credit",
    },
    {
      id: "mca27",
      name: "SmartBiz Loans",
      url: "https://www.smartbizloans.com/",
      category: "mca",
      notes: "SBA loans and term loans",
    },
    {
      id: "mca28",
      name: "Biz2Credit",
      url: "https://www.biz2credit.com/",
      category: "mca",
      notes: "Small business loans and lines of credit",
    },
    {
      id: "mca29",
      name: "Fundbox",
      url: "https://fundbox.com/",
      category: "mca",
      notes: "Business lines of credit and term loans",
    },
    {
      id: "mca30",
      name: "Accion Opportunity Fund",
      url: "https://aofund.org/",
      category: "mca",
      notes: "Small business loans for underserved communities",
    },
    {
      id: "mca31",
      name: "Balboa Capital",
      url: "https://www.balboacapital.com/",
      category: "mca",
      notes: "Equipment financing and business loans",
    },
    {
      id: "mca32",
      name: "Mulligan Funding",
      url: "https://www.mulliganfunding.com/",
      category: "mca",
      notes: "Alternative business financing solutions",
    },
    {
      id: "mca33",
      name: "Bizfi",
      url: "https://www.bizfi.com/",
      category: "mca",
      notes: "Small business loans and equipment financing",
    },
    {
      id: "mca34",
      name: "Funding Solutions",
      url: "https://www.fundingsolutionsnow.com/",
      category: "mca",
      notes: "Fast business funding and MCA",
    },
    {
      id: "mca35",
      name: "Strategic Funding Source",
      url: "https://www.strategicfunding.com/",
      category: "mca",
      notes: "Business cash advances and loans",
    },
    {
      id: "mca36",
      name: "Pearl Capital",
      url: "https://www.pearlcapital.com/",
      category: "mca",
      notes: "Merchant cash advances for businesses",
    },
    {
      id: "mca37",
      name: "Merchant Advisors",
      url: "https://www.merchantadvisors.com/",
      category: "mca",
      notes: "Business funding and consulting",
    },
    {
      id: "mca38",
      name: "Yellowstone Capital",
      url: "https://www.yellowstonecapital.com/",
      category: "mca",
      notes: "Alternative business financing",
    },
    {
      id: "mca39",
      name: "RapidAdvance",
      url: "https://www.rapidadvance.com/",
      category: "mca",
      notes: "Business cash advances and loans",
    },
    {
      id: "mca40",
      name: "Merchant Cash Group",
      url: "https://merchantcashgroup.com/",
      category: "mca",
      notes: "MCA and business funding solutions",
    },
    {
      id: "mca41",
      name: "Business Backer",
      url: "https://www.businessbacker.com/",
      category: "mca",
      notes: "Fast business funding and MCA",
    },
    {
      id: "mca42",
      name: "Everest Business Funding",
      url: "https://www.everestbusinessfunding.com/",
      category: "mca",
      notes: "Business loans and cash advances",
    },
    {
      id: "mca43",
      name: "Headway Capital",
      url: "https://www.headwaycapital.com/",
      category: "mca",
      notes: "Revenue-based financing for businesses",
    },
    {
      id: "3",
      name: "Kickstarter",
      url: "https://www.kickstarter.com/",
      category: "crowdfunding",
      notes: "Creative project crowdfunding",
    },
    {
      id: "4",
      name: "Indiegogo",
      url: "https://www.indiegogo.com/",
      category: "crowdfunding",
      notes: "Flexible crowdfunding platform",
    },
    {
      id: "5",
      name: "GoFundMe",
      url: "https://www.gofundme.com/",
      category: "crowdfunding",
      notes: "Personal fundraising",
    },
    {
      id: "6",
      name: "Patreon",
      url: "https://www.patreon.com/",
      category: "crowdfunding",
      notes: "Membership platform for creators",
    },
    {
      id: "7",
      name: "Crowdfunder",
      url: "https://www.crowdfunder.com/",
      category: "crowdfunding",
      notes: "Business crowdfunding",
    },
    {
      id: "8",
      name: "StartEngine",
      url: "https://www.startengine.com/",
      category: "crowdfunding",
      notes: "Equity crowdfunding",
    },
    {
      id: "9",
      name: "Crowdcube",
      url: "https://www.crowdcube.com/",
      category: "crowdfunding",
      notes: "Investment crowdfunding",
    },
    {
      id: "10",
      name: "Fundable",
      url: "https://www.fundable.com/",
      category: "crowdfunding",
      notes: "Startup crowdfunding",
    },
    { id: "11", name: "Wefunder", url: "https://wefunder.com/", category: "crowdfunding", notes: "Invest in startups" },
    {
      id: "12",
      name: "CrowdStreet",
      url: "https://www.crowdstreet.com/",
      category: "crowdfunding",
      notes: "Real estate crowdfunding",
    },
    {
      id: "13",
      name: "Fundly",
      url: "https://fundly.com/",
      category: "crowdfunding",
      notes: "Social fundraising platform",
    },
    {
      id: "14",
      name: "Crowdfunding.com",
      url: "https://www.crowdfunding.com",
      category: "crowdfunding",
      notes: "Crowdfunding platform aggregator and comparison",
    },
    {
      id: "15",
      name: "CrowdSpace",
      url: "https://thecrowdspace.com",
      category: "crowdfunding",
      notes: "Alternative investment opportunities aggregator",
    },
    {
      id: "16",
      name: "GoFundMe Pro",
      url: "https://pro.gofundme.com",
      category: "crowdfunding",
      notes: "Professional fundraising for nonprofits",
    },
    {
      id: "17",
      name: "spotfund",
      url: "https://www.spotfund.com",
      category: "crowdfunding",
      notes: "GoFundMe alternative crowdfunding platform",
    },
    {
      id: "18",
      name: "SeedInvest",
      url: "https://www.seedinvest.com",
      category: "crowdfunding",
      notes: "Equity crowdfunding for startups",
    },
    {
      id: "19",
      name: "MicroVentures",
      url: "https://microventures.com",
      category: "crowdfunding",
      notes: "Startup investment crowdfunding",
    },
    {
      id: "20",
      name: "Whydonate",
      url: "https://whydonate.com",
      category: "crowdfunding",
      notes: "Personal fundraising and donations",
    },
    {
      id: "21",
      name: "CrowdCrux",
      url: "https://www.crowdcrux.com",
      category: "crowdfunding",
      notes: "Crowdfunding resources for artists and bands",
    },
    {
      id: "22",
      name: "Republic",
      url: "https://republic.com",
      category: "crowdfunding",
      notes: "Invest in startups and crypto",
    },
    {
      id: "23",
      name: "Fundrise",
      url: "https://fundrise.com",
      category: "crowdfunding",
      notes: "Real estate investment crowdfunding",
    },
    {
      id: "24",
      name: "Grants.gov",
      url: "https://www.grants.gov",
      category: "grants",
      notes: "Official federal government grants database",
    },
    {
      id: "25",
      name: "Challenge.gov",
      url: "https://www.challenge.gov",
      category: "grants",
      notes: "Federal prize competitions and innovative funding",
    },
    {
      id: "26",
      name: "Grantify.io",
      url: "https://www.grantify.io",
      category: "grants",
      notes: "Grant management and discovery platform",
    },
    {
      id: "27",
      name: "USA Funding Applications",
      url: "https://www.usafundingapplications.org",
      category: "grants",
      notes: "Comprehensive funding application resources",
    },
    {
      id: "28",
      name: "The Grant Portal",
      url: "https://www.thegrantportal.com",
      category: "grants",
      notes: "Private foundation grants database",
    },
    {
      id: "29",
      name: "Foundation Directory",
      url: "https://fconline.foundationcenter.org",
      category: "grants",
      notes: "Candid's nonprofit grant finder",
    },
    {
      id: "30",
      name: "GrantWatch",
      url: "https://www.grantwatch.com",
      category: "grants",
      notes: "Grants for nonprofits, businesses, and individuals",
    },
    {
      id: "31",
      name: "Instrumentl",
      url: "https://www.instrumentl.com",
      category: "grants",
      notes: "Grant search tool with deadline alerts",
    },
    {
      id: "32",
      name: "Funding for Good",
      url: "https://fundingforgood.org",
      category: "grants",
      notes: "Free grant research tools and resources",
    },
    {
      id: "33",
      name: "NJ Grant Resource Center",
      url: "https://www.njlm.org/538/Grant-Resource-Center",
      category: "grants",
      notes: "New Jersey state grant resources",
    },
    {
      id: "34",
      name: "NJEDA Property Acquisition",
      url: "https://www.njeda.gov",
      category: "grants",
      notes: "NJ property acquisition grants and funding",
    },
    {
      id: "35",
      name: "US Grants - NJ Housing",
      url: "https://www.usgrants.org/new-jersey/housing-grants",
      category: "grants",
      notes: "New Jersey housing grants",
    },
    {
      id: "36",
      name: "GrantStation",
      url: "https://grantstation.com/find-grants/native-americansfirst-nationsindigenous-groups",
      category: "grants",
      notes: "Indigenous and Native American grants",
    },
    {
      id: "37",
      name: "First Nations Development",
      url: "https://www.firstnations.org",
      category: "grants",
      notes: "Native American grantmaking and resources",
    },
    {
      id: "38",
      name: "BIA Grants",
      url: "https://www.bia.gov/topic/grants",
      category: "grants",
      notes: "Bureau of Indian Affairs grant programs",
    },
    {
      id: "39",
      name: "7 Gen Fund",
      url: "https://7genfund.org",
      category: "grants",
      notes: "Indigenous community grants",
    },
    {
      id: "40",
      name: "Native Philanthropy",
      url: "https://nativephilanthropy.org",
      category: "grants",
      notes: "Native Voices Rising grant cycle",
    },
    {
      id: "41",
      name: "The Solutions Project",
      url: "https://thesolutionsproject.org/what-we-do/grantmaking",
      category: "grants",
      notes: "Climate justice and equity grants",
    },
    {
      id: "42",
      name: "International Funders",
      url: "https://internationalfunders.org",
      category: "grants",
      notes: "International grant opportunities",
    },
    {
      id: "43",
      name: "USA.gov Native American Aid",
      url: "https://www.usa.gov/native-american-financial-assistance",
      category: "grants",
      notes: "Federal financial assistance for Native Americans",
    },
    {
      id: "44",
      name: "Maine Community Foundation",
      url: "https://www.mainecf.org/apply-for-a-grant/available-grants-deadlines/black-indigenous-and-people-of-color-fund",
      category: "grants",
      notes: "BIPOC community grants",
    },
    {
      id: "45",
      name: "OHCHR Indigenous Fund",
      url: "https://www.ohchr.org/en/about-us/funding-budget/indigenous-peoples-fund",
      category: "grants",
      notes: "UN Indigenous Peoples Fund",
    },
    {
      id: "46",
      name: "Northwest Area Foundation",
      url: "https://www.nwaf.org/our-grantmaking/grant-listing",
      category: "grants",
      notes: "Regional grantmaking opportunities",
    },
    {
      id: "47",
      name: "ED.gov Native American Grants",
      url: "https://www.ed.gov/grants-and-programs/grants-special-populations/grants-native-americans-alaskan-natives-and-pacific-islanders",
      category: "grants",
      notes: "Department of Education grants for Native Americans",
    },
    {
      id: "48",
      name: "African American Grants",
      url: "https://www.africanamericangrants.org",
      category: "grants",
      notes: "Comprehensive grants for African Americans",
    },
    {
      id: "49",
      name: "NAACP Resources",
      url: "https://naacp.org/find-resources/grants",
      category: "grants",
      notes: "NAACP grant resources and opportunities",
    },
    {
      id: "50",
      name: "Government Funding Kit",
      url: "https://governmentfundingapprovalkit.com",
      category: "grants",
      notes: "Government funding approval resources",
    },
    {
      id: "51",
      name: "Black Women Grants",
      url: "https://www.africanamericangrants.org/grants-for-black-women-federal-state-local-aid.html",
      category: "grants",
      notes: "Federal, state, and local grants for Black women",
    },
    {
      id: "52",
      name: "Black Business Grants",
      url: "https://www.africanamericangrants.org/grants-for-black-men-starting-businesses.html",
      category: "grants",
      notes: "Business startup grants for Black entrepreneurs",
    },
    {
      id: "53",
      name: "Black Writers Grant",
      url: "https://www.africanamericangrants.org/grant-program-black-writer.html",
      category: "grants",
      notes: "Grant programs for Black writers",
    },
    {
      id: "54",
      name: "Black Homeowners Grants",
      url: "https://www.africanamericangrants.org/grants-for-african-american-first-time-home-buyers.html",
      category: "grants",
      notes: "First-time homebuyer grants for African Americans",
    },
    {
      id: "55",
      name: "Bill & Melinda Gates Foundation",
      url: "https://www.gatesfoundation.org",
      category: "donors",
      notes: "Global health, development, and education philanthropy",
    },
    {
      id: "56",
      name: "The Giving Pledge",
      url: "https://givingpledge.org",
      category: "donors",
      notes: "Billionaires committed to giving away majority of wealth",
    },
    {
      id: "57",
      name: "MacKenzie Scott",
      url: "https://mackenzie-scott.medium.com",
      category: "donors",
      notes: "Philanthropist with focus on underserved communities",
    },
    {
      id: "58",
      name: "Chan Zuckerberg Initiative",
      url: "https://chanzuckerberg.com",
      category: "donors",
      notes: "Mark Zuckerberg's philanthropy - science, education, justice",
    },
    {
      id: "59",
      name: "Musk Foundation",
      url: "https://www.muskfoundation.org",
      category: "donors",
      notes: "Elon Musk's foundation - renewable energy, science education",
    },
    {
      id: "60",
      name: "Bloomberg Philanthropies",
      url: "https://www.bloomberg.org",
      category: "donors",
      notes: "Michael Bloomberg - environment, education, public health",
    },
    {
      id: "61",
      name: "Bezos Earth Fund",
      url: "https://www.bezosearthfund.org",
      category: "donors",
      notes: "Jeff Bezos - climate change and environmental initiatives",
    },
    {
      id: "62",
      name: "Rockefeller Foundation",
      url: "https://www.rockefellerfoundation.org",
      category: "donors",
      notes: "Historic foundation - health, food, power, economic mobility",
    },
    {
      id: "63",
      name: "Ford Foundation",
      url: "https://www.fordfoundation.org",
      category: "donors",
      notes: "Social justice, human rights, and democratic values",
    },
    {
      id: "64",
      name: "Carnegie Corporation",
      url: "https://www.carnegie.org",
      category: "donors",
      notes: "Education, democracy, and international peace",
    },
    {
      id: "65",
      name: "Walton Family Foundation",
      url: "https://www.waltonfamilyfoundation.org",
      category: "donors",
      notes: "Education, environment, and community development",
    },
    {
      id: "66",
      name: "Robert Wood Johnson Foundation",
      url: "https://www.rwjf.org",
      category: "donors",
      notes: "Health and healthcare philanthropy",
    },
    {
      id: "67",
      name: "W.K. Kellogg Foundation",
      url: "https://www.wkkf.org",
      category: "donors",
      notes: "Children, families, and racial equity",
    },
    {
      id: "68",
      name: "Gordon and Betty Moore Foundation",
      url: "https://www.moore.org",
      category: "donors",
      notes: "Science, environment, and patient care",
    },
    {
      id: "69",
      name: "Open Society Foundations",
      url: "https://www.opensocietyfoundations.org",
      category: "donors",
      notes: "George Soros - justice, democracy, and human rights",
    },
    {
      id: "70",
      name: "Hewlett Foundation",
      url: "https://hewlett.org",
      category: "donors",
      notes: "Education, environment, and global development",
    },
    {
      id: "71",
      name: "Andrew W. Mellon Foundation",
      url: "https://mellon.org",
      category: "donors",
      notes: "Arts, culture, and higher education",
    },
    {
      id: "72",
      name: "Simons Foundation",
      url: "https://www.simonsfoundation.org",
      category: "donors",
      notes: "Mathematics and basic sciences research",
    },
    {
      id: "73",
      name: "Kavli Foundation",
      url: "https://www.kavlifoundation.org",
      category: "donors",
      notes: "Astrophysics, nanoscience, and neuroscience",
    },
    {
      id: "74",
      name: "Skoll Foundation",
      url: "https://skoll.org",
      category: "donors",
      notes: "Jeff Skoll - social entrepreneurship and innovation",
    },
    {
      id: "75",
      name: "Omidyar Network",
      url: "https://omidyar.com",
      category: "donors",
      notes: "Pierre Omidyar - social change and economic opportunity",
    },
    {
      id: "76",
      name: "Knight Foundation",
      url: "https://knightfoundation.org",
      category: "donors",
      notes: "Journalism, arts, and community engagement",
    },
    {
      id: "77",
      name: "Packard Foundation",
      url: "https://www.packard.org",
      category: "donors",
      notes: "Conservation, science, and children's health",
    },
    {
      id: "78",
      name: "Kresge Foundation",
      url: "https://kresge.org",
      category: "donors",
      notes: "Expanding opportunities in cities",
    },
    {
      id: "79",
      name: "Arnold Ventures",
      url: "https://www.arnoldventures.org",
      category: "donors",
      notes: "Evidence-based policy solutions",
    },
    {
      id: "80",
      name: "Andreessen Horowitz",
      url: "https://a16z.com",
      category: "vc",
      notes: "$42B AUM - North America",
    },
    {
      id: "81",
      name: "General Catalyst",
      url: "https://www.generalcatalyst.com",
      category: "vc",
      notes: "$40B AUM - North America",
    },
    {
      id: "82",
      name: "Sequoia Capital",
      url: "https://www.sequoiacap.com",
      category: "vc",
      notes: "$28.3B AUM - North America",
    },
    {
      id: "83",
      name: "Dragoneer Investment Group",
      url: "https://www.dragoneer.com",
      category: "vc",
      notes: "$24.9B AUM - North America",
    },
    {
      id: "84",
      name: "New Enterprise Associates",
      url: "https://www.nea.com",
      category: "vc",
      notes: "$17.8B AUM - North America",
    },
    {
      id: "85",
      name: "Greenspring Associates",
      url: "https://www.greenspringassociates.com",
      category: "vc",
      notes: "$15.3B AUM - North America",
    },
    {
      id: "86",
      name: "Deerfield Management",
      url: "https://www.deerfieldmgmt.com",
      category: "vc",
      notes: "$15.1B AUM - Healthcare focus",
    },
    {
      id: "87",
      name: "Khosla Ventures",
      url: "https://www.khoslaventures.com",
      category: "vc",
      notes: "$14B AUM - North America",
    },
    {
      id: "88",
      name: "Norwest Venture Partners",
      url: "https://www.nvp.com",
      category: "vc",
      notes: "$12.5B AUM - North America",
    },
    {
      id: "89",
      name: "Legend Capital",
      url: "https://www.legendcapital.com.cn",
      category: "vc",
      notes: "$9.5B AUM - Asia",
    },
    { id: "90", name: "B Capital Group", url: "https://www.bcapgroup.com", category: "vc", notes: "North America" },
    {
      id: "91",
      name: "Lightspeed Venture Partners",
      url: "https://lsvp.com",
      category: "vc",
      notes: "Multi-stage VC - North America",
    },
    { id: "92", name: "Kaitai Capital", url: "https://www.kaitaicapital.com", category: "vc", notes: "Asia" },
    {
      id: "93",
      name: "Industry Ventures",
      url: "https://www.industryventures.com",
      category: "vc",
      notes: "Secondary market - North America",
    },
    {
      id: "94",
      name: "Kleiner Perkins",
      url: "https://www.kleinerperkins.com",
      category: "vc",
      notes: "Legendary VC - North America",
    },
    {
      id: "95",
      name: "Qiming Venture Partners",
      url: "https://www.qimingvc.com",
      category: "vc",
      notes: "Healthcare & tech - Asia",
    },
    {
      id: "96",
      name: "Battery Ventures",
      url: "https://www.battery.com",
      category: "vc",
      notes: "Technology investments - North America",
    },
    {
      id: "97",
      name: "IDG Capital",
      url: "https://www.idgcapital.com",
      category: "vc",
      notes: "Tech & consumer - Asia",
    },
    {
      id: "98",
      name: "Energy Impact Partners",
      url: "https://www.energyimpactpartners.com",
      category: "vc",
      notes: "Energy & sustainability",
    },
    {
      id: "99",
      name: "Lux Capital",
      url: "https://www.luxcapital.com",
      category: "vc",
      notes: "Science & tech - North America",
    },
    {
      id: "100",
      name: "Oriental Fortune Capital",
      url: "https://www.ofcapital.com",
      category: "vc",
      notes: "Financial services - Asia",
    },
    {
      id: "101",
      name: "Greylock Partners",
      url: "https://greylock.com",
      category: "vc",
      notes: "Enterprise & consumer - North America",
    },
    {
      id: "102",
      name: "Fifth Wall",
      url: "https://fifthwall.com",
      category: "vc",
      notes: "Real estate tech - North America",
    },
    {
      id: "103",
      name: "5Y Capital",
      url: "https://www.5ycapital.com",
      category: "vc",
      notes: "Consumer & tech - Asia",
    },
    { id: "104", name: "FinTrek Capital", url: "https://www.fintrek.com", category: "vc", notes: "Fintech - Asia" },
    {
      id: "105",
      name: "Eden Block",
      url: "https://www.edenblock.com",
      category: "vc",
      notes: "Blockchain - Middle East",
    },
    {
      id: "106",
      name: "Shunwei Capital",
      url: "https://www.shunwei.com",
      category: "vc",
      notes: "Mobile & internet - Asia",
    },
    {
      id: "107",
      name: "DFJ (Draper Fisher Jurvetson)",
      url: "https://dfj.com",
      category: "vc",
      notes: "North America",
    },
    { id: "108", name: "83North", url: "https://www.83north.com", category: "vc", notes: "Europe & Israel" },
    { id: "109", name: "Human Capital", url: "https://www.humancapital.vc", category: "vc", notes: "North America" },
    {
      id: "110",
      name: "Partech Partners",
      url: "https://partechpartners.com",
      category: "vc",
      notes: "Europe & Africa",
    },
    {
      id: "111",
      name: "Weathergage Capital",
      url: "https://www.weathergagecap.com",
      category: "vc",
      notes: "North America",
    },
    {
      id: "112",
      name: "Abingworth",
      url: "https://www.abingworth.com",
      category: "vc",
      notes: "Life sciences - Europe",
    },
    { id: "113", name: "Linear Capital", url: "https://www.linearcapital.com", category: "vc", notes: "Tech - Asia" },
    {
      id: "114",
      name: "Sierra Ventures",
      url: "https://www.sierraventures.com",
      category: "vc",
      notes: "North America",
    },
    {
      id: "115",
      name: "Blockchain Capital",
      url: "https://blockchain.capital",
      category: "vc",
      notes: "Crypto & blockchain",
    },
    { id: "116", name: "Linse Capital", url: "https://www.linsecapital.com", category: "vc", notes: "North America" },
    {
      id: "117",
      name: "Green Pine Capital",
      url: "https://www.greenpinecapital.com",
      category: "vc",
      notes: "Healthcare - Asia",
    },
    { id: "118", name: "Cendana Capital", url: "https://www.cendana.com", category: "vc", notes: "Fund of funds" },
    { id: "119", name: "Gobi Partners", url: "https://www.gobivc.com", category: "vc", notes: "Emerging Asia" },
    { id: "120", name: "6 Dimensions Capital", url: "https://www.6dcapital.com", category: "vc", notes: "Asia" },
    {
      id: "121",
      name: "Sinovation Ventures",
      url: "https://www.sinovationventures.com",
      category: "vc",
      notes: "AI & tech - Asia",
    },
    { id: "122", name: "MindWorks Ventures", url: "https://www.mindworks.vc", category: "vc", notes: "Asia" },
    {
      id: "123",
      name: "Base10 Partners",
      url: "https://base10.vc",
      category: "vc",
      notes: "Automation - North America",
    },
    { id: "124", name: "aMoon Fund", url: "https://www.amoonfund.com", category: "vc", notes: "Healthcare - Israel" },
    {
      id: "125",
      name: "GreenPoint Partners",
      url: "https://www.greenpointpartners.com",
      category: "vc",
      notes: "North America",
    },
    {
      id: "126",
      name: "Samsara BioCapital",
      url: "https://www.sambiocap.com",
      category: "vc",
      notes: "Life sciences - North America",
    },
    { id: "127", name: "Fortune Capital", url: "https://www.fortunevc.com", category: "vc", notes: "Asia" },
    { id: "128", name: "ATM Capital", url: "https://www.atmcapital.com", category: "vc", notes: "Asia" },
    { id: "129", name: "Quona Capital", url: "https://quona.com", category: "vc", notes: "Fintech - Emerging markets" },
    {
      id: "130",
      name: "China Growth Capital",
      url: "https://www.chinagrowthcapital.com",
      category: "vc",
      notes: "Asia",
    },
    { id: "131", name: "Global Brain", url: "https://globalbrains.com", category: "vc", notes: "Japan & Asia" },
    {
      id: "132",
      name: "Titanium Ventures",
      url: "https://www.titaniumventures.com",
      category: "vc",
      notes: "Australia",
    },
    { id: "133", name: "Nyca Partners", url: "https://nyca.com", category: "vc", notes: "Fintech - North America" },
    { id: "134", name: "Beringea", url: "https://www.beringea.com", category: "vc", notes: "UK & US" },
    { id: "135", name: "Playground Global", url: "https://playground.global", category: "vc", notes: "Deep tech" },
    { id: "136", name: "TS Investment", url: "https://www.tsinvestment.com", category: "vc", notes: "Asia" },
    {
      id: "137",
      name: "New Leaf Venture Partners",
      url: "https://www.nlvp.com",
      category: "vc",
      notes: "Healthcare - North America",
    },
    { id: "138", name: "Gobi Ventures", url: "https://www.gobiventures.com", category: "vc", notes: "Southeast Asia" },
    { id: "139", name: "Partners for Growth", url: "https://www.pfgrowth.com", category: "vc", notes: "Venture debt" },
    {
      id: "140",
      name: "Northern Light VC",
      url: "https://www.nlvc.com",
      category: "vc",
      notes: "Early stage - North America",
    },
    { id: "141", name: "776 Fund", url: "https://www.776.vc", category: "vc", notes: "Alexis Ohanian's fund" },
    { id: "142", name: "ZhenFund", url: "https://www.zhenfund.com", category: "vc", notes: "Early stage - China" },
    { id: "143", name: "Lightbank", url: "https://lightbank.com", category: "vc", notes: "Chicago-based VC" },
    {
      id: "144",
      name: "Patient Square Capital",
      url: "https://www.patientsquare.com",
      category: "vc",
      notes: "Healthcare",
    },
    { id: "145", name: "AltaIR Capital", url: "https://www.altaircapital.com", category: "vc", notes: "Russia & CIS" },
    { id: "146", name: "Wavemaker Partners", url: "https://www.wavemaker.vc", category: "vc", notes: "Southeast Asia" },
    {
      id: "147",
      name: "Y Combinator",
      url: "https://www.ycombinator.com",
      category: "vc",
      notes: "Top startup accelerator",
    },
    { id: "148", name: "Lapam Venture", url: "https://www.lapam.vc", category: "vc", notes: "Asia" },
    {
      id: "149",
      name: "360 Capital Partners",
      url: "https://www.360capitalpartners.com",
      category: "vc",
      notes: "Europe",
    },
    { id: "150", name: "Truffle Capital", url: "https://www.truffle.com", category: "vc", notes: "Deep tech - Europe" },
    {
      id: "151",
      name: "Voyager Capital",
      url: "https://www.voyagercapital.com",
      category: "vc",
      notes: "Pacific Northwest",
    },
    { id: "152", name: "Flashpoint VC", url: "https://www.flashpoint.vc", category: "vc", notes: "Europe" },
    {
      id: "153",
      name: "Fusion Fund",
      url: "https://www.fusion.fund",
      category: "vc",
      notes: "Deep tech - North America",
    },
    { id: "154", name: "Platform Fund", url: "https://www.platformfund.com", category: "vc", notes: "North America" },
    { id: "155", name: "Venture Catalysts", url: "https://www.venturecatalysts.in", category: "vc", notes: "India" },
    { id: "156", name: "WAED Ventures", url: "https://www.waed.vc", category: "vc", notes: "Middle East" },
    { id: "157", name: "BECO Capital", url: "https://www.beco.capital", category: "vc", notes: "Middle East" },
    {
      id: "158",
      name: "Cowin Capital",
      url: "https://www.cowincapital.com",
      category: "vc",
      notes: "Healthcare - Asia",
    },
    {
      id: "159",
      name: "Airbus Ventures",
      url: "https://www.airbusventures.vc",
      category: "vc",
      notes: "Aerospace tech",
    },
    { id: "160", name: "K2VC", url: "https://www.k2vc.com", category: "vc", notes: "Asia" },
    { id: "161", name: "FPV Ventures", url: "https://www.fpv.vc", category: "vc", notes: "North America" },
    { id: "162", name: "Techstars", url: "https://www.techstars.com", category: "vc", notes: "Global accelerator" },
    {
      id: "163",
      name: "Zetta Venture Partners",
      url: "https://www.zetta.vc",
      category: "vc",
      notes: "Enterprise tech",
    },
    { id: "164", name: "Plum Ventures", url: "https://www.plumventures.com", category: "vc", notes: "Asia" },
    { id: "165", name: "Renaissance VC", url: "https://www.renaissancevc.com", category: "vc", notes: "North America" },
    {
      id: "166",
      name: "Morgenthaler Ventures",
      url: "https://www.morgenthaler.com",
      category: "vc",
      notes: "North America",
    },
    { id: "167", name: "Ausvic Capital", url: "https://www.ausvic.com", category: "vc", notes: "Asia" },
    {
      id: "168",
      name: "Material Impact",
      url: "https://www.materialimpact.com",
      category: "vc",
      notes: "Climate tech - North America",
    },
    { id: "169", name: "Synthesis Capital", url: "https://www.synthesiscap.com", category: "vc", notes: "Europe" },
    { id: "170", name: "Faction VC", url: "https://www.faction.vc", category: "vc", notes: "North America" },
    {
      id: "171",
      name: "Middle East Venture Partners",
      url: "https://www.mevp.com",
      category: "vc",
      notes: "Middle East & North Africa",
    },
    {
      id: "172",
      name: "Golden Gate Ventures",
      url: "https://www.goldengate.vc",
      category: "vc",
      notes: "Southeast Asia",
    },
    { id: "173", name: "Vectr Ventures", url: "https://www.vectrventures.com", category: "vc", notes: "Asia" },
    { id: "174", name: "Vine Ventures", url: "https://www.vineventures.com", category: "vc", notes: "North America" },
    { id: "175", name: "January Capital", url: "https://www.januarycapital.com", category: "vc", notes: "Asia" },
    { id: "176", name: "Cardumen Capital", url: "https://www.cardumen.com", category: "vc", notes: "Europe" },
    { id: "177", name: "UTOPIA Capital", url: "https://www.utopiacapital.com", category: "vc", notes: "Europe" },
    { id: "178", name: "Blume Ventures", url: "https://www.blume.vc", category: "vc", notes: "India" },
    {
      id: "179",
      name: "SV Angel",
      url: "https://www.svangel.com",
      category: "vc",
      notes: "Seed stage - Silicon Valley",
    },
  ])

  const [newResource, setNewResource] = useState({
    name: "",
    url: "",
    category: "mca" as const,
    notes: "",
  })

  const categories = [
    { id: "mca", label: "MCA/Banks", icon: Building2, color: "from-blue-500 to-blue-600", target: 100 },
    { id: "crowdfunding", label: "Crowdfunding", icon: Users, color: "from-purple-500 to-purple-600", target: 25 },
    { id: "donors", label: "Donors", icon: Gift, color: "from-green-500 to-green-600", target: 25 },
    { id: "grants", label: "Grants", icon: Landmark, color: "from-orange-500 to-orange-600", target: 100 },
    { id: "vc", label: "Venture Capital", icon: TrendingUp, color: "from-red-500 to-red-600", target: 100 },
  ]

  const addResource = () => {
    if (newResource.name && newResource.url) {
      setResources([
        ...resources,
        {
          id: Date.now().toString(),
          ...newResource,
        },
      ])
      setNewResource({ name: "", url: "", category: "mca", notes: "" })
    }
  }

  const deleteResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id))
  }

  const getResourcesByCategory = (category: string) => {
    return resources.filter((r) => r.category === category)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Funding Resources</h2>
          <p className="text-white/60">Manage your funding platform connections</p>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const count = getResourcesByCategory(cat.id).length
          const Icon = cat.icon
          return (
            <Card key={cat.id} className="bg-black/40 border-white/10 backdrop-blur-sm p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${cat.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/60">{cat.label}</p>
                  <p className="text-2xl font-bold text-white">
                    {count}/{cat.target}
                  </p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${cat.color}`}
                  style={{ width: `${Math.min((count / cat.target) * 100, 100)}%` }}
                />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Add New Resource */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Add New Resource</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Platform Name</Label>
            <Input
              value={newResource.name}
              onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
              placeholder="e.g., Daily Funder"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white">URL</Label>
            <Input
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              placeholder="https://example.com"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Category</Label>
            <select
              value={newResource.category}
              onChange={(e) => setNewResource({ ...newResource, category: e.target.value as any })}
              className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white"
            >
              <option value="mca">MCA/Banks</option>
              <option value="crowdfunding">Crowdfunding</option>
              <option value="donors">Donors</option>
              <option value="grants">Grants</option>
              <option value="vc">Venture Capital</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-white">Notes (Optional)</Label>
            <Input
              value={newResource.notes}
              onChange={(e) => setNewResource({ ...newResource, notes: e.target.value })}
              placeholder="Additional notes"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
        <Button onClick={addResource} className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </Card>

      {/* Resources by Category */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <Tabs defaultValue="mca" className="w-full">
          <TabsList className="w-full justify-start bg-black/20 border-b border-white/10 rounded-none">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {cat.label}
                  <Badge variant="secondary" className="ml-2">
                    {getResourcesByCategory(cat.id).length}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="p-6">
              <div className="space-y-3">
                {getResourcesByCategory(cat.id).length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    No resources added yet. Add your first {cat.label.toLowerCase()} platform above.
                  </div>
                ) : (
                  getResourcesByCategory(cat.id).map((resource) => (
                    <Card key={resource.id} className="bg-white/5 border-white/10 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-semibold text-white">{resource.name}</h4>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          <p className="text-sm text-white/60 mt-1">{resource.url}</p>
                          {resource.notes && <p className="text-sm text-white/80 mt-2">{resource.notes}</p>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteResource(resource.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  )
}
