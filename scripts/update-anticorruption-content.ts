
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const contentUpdates = [
    {
        titleMatch: "Introduction",
        newContent: `# Understanding Corruption and Bribery

* **Corruption**: The abuse of entrusted power (public or private) for private gain. Includes embezzlement, fraud, extortion, cronyism, and nepotism.
* **Bribery**: Offering, promising, giving, accepting, or soliciting an undue advantage to influence a decision or outcome.

## Impact on Businesses: Beyond Fines

> **Critical Business Impacts**
>
> * **Financial Losses**: Direct penalties, legal defense costs, investigation expenses, asset forfeiture.
> * **Reputational Damage**: Brand image erosion, loss of customer loyalty, negative media scrutiny.
> * **Legal Penalties**: Imprisonment for individuals, corporate liability, contract debarment.
> * **Operational Disruption**: Lengthy investigations, freezing of assets.

## Why Focus on India?

* India has a **robust and evolving legal framework** with increased enforcement efforts.
* Complex regulatory landscape requires careful navigation.
* Growing global scrutiny and **extraterritorial laws** (FCPA, UK Bribery Act) demand compliance.

## Training Objectives

> **By the end of this training, you will:**
>
> * Gain comprehensive understanding of the legal and regulatory framework.
> * Accurately identify common red flags and high-risk scenarios.
> * Know practical steps for compliance, prevention, and reporting.
> * Cultivate a strong culture of integrity.
`
    },
    {
        titleMatch: "Indian Legal Landscape",
        newContent: `# Prevention of Corruption Act, 1988 (PCA)

> **The Cornerstone of Indian Anti-Corruption Law**
>
> Primary legislation in India to combat corruption, specifically targeting public servants.

## Broad Definition of "Public Servant"

The PCA defines a public servant very broadly, including:

* Any person in the service or pay of the Government
* Employees of local authorities or government corporations
* Judges, arbitrators, and court-authorized persons
* Office bearers of registered co-operative societies receiving aid

## Key Offenses Under PCA

* **Section 7**: Public servant taking gratification for performing official acts
* **Section 8**: Taking gratification to influence public servant by corrupt means
* **Section 9**: Bribing a public servant by a commercial organization
* **Section 10**: Personal liability of persons in charge of commercial organizations

## 2018 Amendments - Critical Changes

> **Major 2018 Updates**
>
> * **Criminalized Bribe-Giving**: Both givers and takers are equally liable.
> * **Prior Sanction Required**: Government approval needed for investigations.
> * **Enhanced Penalties**: 3 to 7 years imprisonment.
> * **"Adequate Procedures" Defense**: Companies can defend if they had robust compliance.
`
    },
    {
        titleMatch: "International Anti-Bribery",
        newContent: `# Foreign Corrupt Practices Act (FCPA) - USA

> **Enacted in 1977**
>
> Prevents US companies and individuals from bribing foreign government officials to obtain or retain business.

## Who Does FCPA Apply To?

* **US Issuers**: Any company with securities listed on US stock exchange
* **US Domestic Concerns**: Any US citizen, national, resident, or business entity
* **Foreign Persons/Entities**: Non-US entities committing acts while in US territory

> **Broad Jurisdictional Reach**
>
> Even a single email through US servers, a phone call routed through US networks, or a bank transaction through a US institution can establish FCPA jurisdiction.

## Key FCPA Components

* **Anti-Bribery Provisions**: Criminalizes corrupt payments of "anything of value" to foreign officials
* **Accounting Provisions**: Requires accurate books/records and robust internal accounting controls

## UK Bribery Act, 2010

> **One of the Strictest Globally**
>
> Covers bribery in both public and private sectors with broad extraterritorial reach.

## Key Offenses

* **Section 1**: Bribing another person
* **Section 2**: Being bribed
* **Section 6**: Bribery of foreign public officials
* **Section 7**: Failure of commercial organizations to prevent bribery (strict liability)
`
    }
]

async function main() {
    // 1. Get the module
    const { data: modules, error: moduleError } = await supabase
        .from('modules')
        .select('id, title')
        .ilike('title', '%Anti-Corruption%')
        .single()

    if (moduleError || !modules) {
        console.error('Module not found:', moduleError)
        return
    }

    console.log(`Found module: ${modules.title} (${modules.id})`)

    // 2. Get slides
    const { data: slides, error: slidesError } = await supabase
        .from('slides')
        .select('id, title')
        .eq('module_id', modules.id)
        .order('sequence_order', { ascending: true })

    if (slidesError || !slides) {
        console.error('Slides not found:', slidesError)
        return
    }

    console.log(`Found ${slides.length} slides. Updating content...`)

    // 3. Update slides
    for (const update of contentUpdates) {
        const slide = slides.find(s => s.title.includes(update.titleMatch))
        if (slide) {
            console.log(`Updating slide: ${slide.title}...`)
            const { error } = await supabase
                .from('slides')
                .update({ content: update.newContent })
                .eq('id', slide.id)

            if (error) console.error(`Error updating ${slide.title}:`, error)
            else console.log(`Success!`)
        } else {
            console.warn(`No slide found matching sections "${update.titleMatch}"`)
        }
    }
}

main()
