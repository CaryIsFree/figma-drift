# Outreach Guide - Figma Drift Detection

**Date**: 2026-01-23
**Status**: Ready for Phase 1C Outreach

---

## Executive Summary

**Problem Validation**: ✅ CONFIRMED
- $58.5K/mo lost per 10-person team
- 43% of design feedback never implemented
- 90% of teams experience launch delays
- $76.9B market opportunity (visual regression testing by 2034)

**Market Gap**: ✅ CONFIRMED
- Enterprise tools: Applitools ($969/mo), Chromatic ($179/mo), Percy ($39/mo)
- Prosumer gap: No affordable ($20-100/mo) automated Figma-native tool exists
- Pixelay ($20/mo) is manual overlay only

**ICP**: ✅ CLARIFIED
- Primary: Implementers (developers/QA) running: `drift-detect --figma=URL --live=URL`
- Secondary: Design system teams (benefit from drift reports)
- NOT: Individual devs or early-stage startups without design governance

**Outreach Strategy**: Target the 20% who CAN afford this tool and CARE about brand consistency.

---

## Priority Tier 1: Active Pain Point Hunters (REACH NOW)

**Strategy**: Reply directly to people actively experiencing design drift TODAY. High conversion potential.

### GitHub Issue Authors (Direct Replies)

| Person | Platform | Issue | Problem | Outreach Action | Message Template |
|---------|---------|-------|---------|----------------|----------------|
| **Rasmus Schultz** | Figma Forum | Figma's rendered pixels ~8% smaller than Chromium, causing "blown up" designs | Reply on Figma Forum | "Hey Rasmus, saw your post about 8% rendering discrepancy between Figma and Chromium. I'm building a CLI tool that compares Figma specs directly to live browser renders to catch these drifts automatically. Would love your feedback - can I DM you a demo?" |
| **Christian Byrne** | GitHub (ComfyUI) | Skeleton loading states don't match updated PackCard design (jarring visual transition) | Reply on GitHub issue | "Hey Christian, saw your issue about PackCardSkeleton drift. Building an automated Figma→production comparison tool. Want to test on your use case?" |
| **Jagadeeshftw** | GitHub (StelloPay) | Dashboard design doesn't match Figma (7 areas: spacing, hierarchy, color) | Reply on GitHub issue | "Your issue listing 'Figma vs. Current' mismatches is EXACTLY what I'm solving. Free beta access?" |
| **pbrissaud** | GitHub (Kubeasy) | Off-brand colors diluting purple brand identity | Reply on GitHub issue | "Brand dilution is my focus. My tool catches off-brand colors automatically. Want to try?" |
| **KristyleModin** | GitHub (SAMAHAN) | Navbar styling mismatch (not semi-transparent, wrong rounded corners) | Reply on GitHub issue | "Saw your navbar styling issue. My tool catches these mismatches automatically. Free beta access?" |
| **Priya R** | CodeSpell Blog | Every Figma handoff feels like "déjà vu" - developers starting over | Reply on blog post | "Handoff continuity is my focus. Building automated drift detection. Want feedback from a practitioner?" |

### Twitter/X Complainers (DM Strategy)

| Person | Handle | Tweet/Topic | Problem | Outreach Action | Message Template |
|---------|--------|-----------|---------|----------------|----------------|
| **@lingodotdev** | Lingo.dev | "Figma vs Production 😂" (viral meme showing disparity) | DM on Twitter | "Saw your tweet about Figma vs production gap. Building a CLI tool to catch drift automatically. Want to try beta?" |
| **@lewis_healey** | Atlassian | Design-Code Parity, AI-driven workflows | DM on Twitter | "Your work on Figma-code parity is exactly what I'm building. Free beta access for feedback?" |
| **@TkDodo** | Sentry Design Engineering | "Frankenstein UI" problem from design drift | DM on Twitter | "Your 'Scraps' system approach is perfect for automated drift detection. Want to test?" |
| **@matthew_hall** | Productic | "Designing Against Drift: When Good Products Decay" | DM on Twitter | "Your 'product decay' framework is exactly what I'm solving. Enterprise drift detection for $20/mo vs $969/mo Applitools?" |
| **@omri_levy** | Baz co-founder | "Pixel Perfect by Baz — Make designs and implementations match" | DM on Twitter | "Your approach to parity is exactly my target. Student founder, looking for design system practitioner feedback. Can we chat 15min?" |
| **@noahidavis** | Techworks Studio | "The Designer-Developer Handoff Is Still Broken" | DM on Twitter | "Saw your post on broken handoff. Building automated Figma→production drift detection. Free beta access for feedback?" |

---

## Priority Tier 2: UMich Alumni Network (WARM INTROS)

**Strategy**: Leverage "fellow Wolverine" empathy. Alumni help students.

### Direct Alumni Outreach

| Alumni | Company | Role | Education | Why Reach | Contact Method | Message Template |
|---------|---------|------|----------|-----------|----------------|----------------|
| **Ayana Leelasena** | Figma | Figma Campus Leader / Design Community Lead | Leads Figma Education at UMich | LinkedIn Figma network or DM on X | "Hi Ayana, I'm a UMich student building a tool to detect design drift between Figma and live implementations. Given your role leading Figma Education at UMich, I'd value your perspective on whether this is something Figma users would pay for. 15min call for feedback?" |
| **Abigail Ng** | Stripe | Software Engineer (Frontend) | UMich BS CS '22 | LinkedIn, DM if available | "Hey Abigail, fellow UMich alum ('22). Building CLI tool to catch design drift in CI/CD. Stripe uses Figma—would you use a $20/mo tool to automate parity checks?" |
| **Max Yinger** | Shopify | Design Engineer (Interaction & Perf) | UMich BS CS '16 | LinkedIn, Twitter @myinger | "Hey Max, UMich alum ('16). Building Figma→production drift detection CLI. Shopify uses design systems—would this solve your workflow problems?" |
| **Sierre Wolfkostin** | Duo Security | Senior Product Designer | UMSI | LinkedIn | "Hi Sierre, fellow UMSI alum. Building automated drift detection for design systems. Given your design system work at Duo, does this resonate? 15min for feedback?" |
| **Jessica Thomas** | Notion | Senior Product Designer | UMSI MSI '23 | LinkedIn | "Hi Jessica, UMSI alum ('23). Building tool to catch design drift in production. Notion has a design system—would your team use automated parity checks?" |
| **Jim Rampton** | General Motors | Lead Product Designer | UMSI Lecturer III, 20+ years UX | LinkedIn | "Hi Jim, I'm a UMSI student building a tool for design drift detection. Given your work teaching Automotive UX, is this a problem GM cares about? Looking for practitioner feedback." |
| **Stephanie Brenton** | UMSI | Lecturer III, Senior UX Manager | UMSI | Email: stephanib@umich.edu | "Hi Stephanie, I'm a UMSI student building a tool to detect design drift between Figma and production. Given your 20+ years of UX leadership, is this a problem practitioners would pay $20/mo to solve? Looking for mentorship." |

### UMich Student Organizations (POST IN DISCORD)

| Organization | Type | Best For | Discord/Channel | Contact | Action |
|-------------|------|----------|----------------|---------|--------|
| **V1 Michigan** | High-growth, startup-minded builders | V1 Discord (#product-studio or #general) | [Website](https://v1michigan.com/) | Post outreach message in #product-studio channel |
| **Michigan Hackers** | General tech + design students | Michigan Hackers Discord (#design-subteam or #web-dev) | [Website](https://michhackers.com/) | Post in #design-subteam |
| **SOCHI** | HCI/UX focus students | Email | sochi@umich.edu | Email leadership about workshop/demo opportunity |
| **Mintify** | UX Design Club | Discord/MCommunity | [Arts at Michigan](https://artsatmichigan.umich.edu/studentorgs/directory/view.php?id=554) | Post about beta testing opportunity |
| **Shift Creator Space** | Mix of designers, developers, artists | Discord | shift.creatorspace@gmail.com | Join Discord, post in #general |

### UMich Professors (MENTORSHIP ACCESS)

| Professor | Department | Industry Connection | Why Reach | Contact | Action |
|-----------|----------|-------------------|-----------|--------|
| **Stephanie Brenton** | UMSI Lecturer III | Teaches SI 699 (User-Centered Agile Development), primary bridge for students entering workforce with real industry clients | stephanib@umich.edu | Email for mentorship/intro to industry connections |
| **Jim Rampton** | UMSI Lecturer III | Lead Product Designer at General Motors, runs Automotive UX program at UMich | LinkedIn | Leverage for GM connection if relevant |

---

## Priority Tier 3: Design System Practitioners (COLD EMAIL/DM)

**Strategy**: Target people who WRITE about design drift professionally. High relevance, lower response rate.

### Design System Leads

| Practitioner | Company | Role | Why Reach | Contact | Message Template |
|-------------|---------|------|-----------|--------|----------------|
| **Rauno Freiberg** | Vercel | Design Engineer | Vercel is THE design-forward company (Geist system, v0 AI), Rauno is most influential globally | Twitter: @raunofreiberg, LinkedIn | "Hi Rauno, saw your posts on Geist and design systems. I'm building a CLI tool for Figma→production drift detection. $20/mo vs $969/mo Applitools. Want 10min call to hear if this is valuable?" |
| **Lee Munroe** | Sentry | Design System Lead | Leads "Beam" design system, vocal about "Frankenstein UI" from drift | Twitter: @leemunroe, LinkedIn | "Hey Lee, your 'Scraps' system and 'Frankenstein UI' posts are exactly what I'm solving. Building automated drift detection CLI. Sentry would use this—want feedback?" |
| **Joey Banks** | Notion/Indie | Design Systems Consultant | Most prolific design system educator on Twitter ("Basics aren't Basic" newsletter) | Twitter: @joeyabanks | "Hi Joey, I'm a student founder building automated drift detection. Your 'Basics aren't Basic' is exactly my audience. Free beta access for your newsletter subscribers?" |
| **Varya Stepanova** | Independent Consultant | Design Systems Engineer & Consultant | Writes about "industrial" design ops, governance workflows | Twitter: @varya_en, LinkedIn | "Hi Varya, student founder building automated drift detection CLI. Your governance focus is exactly my target customer. Enterprise-grade parity detection for $20/mo. Feedback?" |
| **Lewis Healey** | Atlassian | Design Technologist | Design-Code Parity, AI-driven workflows | Twitter: @lewis_healey, LinkedIn | "Hi Lewis, your 'close the gap' work on Figma-code parity is exactly what I'm building. Free beta access for feedback? 15min call?" |

### Blog Authors & Speakers

| Practitioner | Focus | Why Reach | Contact | Message Template |
|-------------|-------|-----------|--------|----------------|
| **Matthew Hall** | Productic (Design Ops) | "Product Decay" and structural drift | LinkedIn: [matthew-hall-33a10b29] | "Hey Matthew, your 'product decay' framework is exactly what I'm solving. Free beta access?" |
| **Dominik Dorfmeister** (TkDodo) | Sentry Design Engineering | "Designing Design Systems" | Twitter: @TkDodo | "Hey Dominik, your 'Scraps' system approach is perfect for automated drift detection. Want to test?" |

---

## Priority Tier 4: Startup Founders (EMPATHY APPROACH)

**Strategy**: Student-founder to founder empathy. They get the journey.

### Founder Outreach

| Founder | Company | Background | Why Reach | Contact | Message Template |
|---------|---------|-----------|-----------|--------|----------------|
| **Honey Mittal** | Locofy.ai | Design-to-code automation, CEO with Accel/Northstar backing | Twitter: @HoneyMittal | "Hi Honey, fellow founder. I'm building CLI tool to catch design drift between Figma and production. Locofy works with Figma—would this solve your workflow? Free beta access, happy to give student founder feedback." |
| **Stephen Haney** | Paper | Code-native design tool, $4.2M Seed | Twitter: @stephenhaney | "Saw your post about 'messy reality' of design tools. Building drift detection. 15min call?" |
| **Moe Amaya** | Monograph | Design systems, "trust gap" between design and engineering | Twitter: @moeamaya | "Your 'trust gap' posts resonate. Student founder here. Free beta access?" |
| **Jiri Turek** | Supernova.io | Frustrated by "design-developer back-and-forth" | LinkedIn | "Your Series A post about back-and-forth frustration is exactly what I'm solving. Free beta access?" |
| **Steve Sewell** | Builder.io | "Vibe Coding", AI agents for design/code | Twitter: @sewellstephen | "Saw your Fusion 1.0 AI agent for design/code. My CLI does Figma→production drift detection. Compare approaches?" |
| **Will DePue** | OpenAI (Sora), ex-V1/Notion | UMich CS '25 (on leave), V1 founder | V1 Discord community | "Hey Will, fellow UMich student building Figma drift detection. Given your V1 background, does this problem resonate? Free beta access for feedback?" |

---

## Priority Tier 5: Junior/Mid-Level Designers (APPROACHABLE)

**Strategy**: These people can test your tool immediately. No approval needed.

### Junior Designer Outreach

| Designer | Company | Focus | Why Reach | Contact | Message Template |
|----------|---------|-------|-----------|--------|----------------|
| **Vetrivel Chinnasamy** | Stealth startup | Figma plugins, community active | Twitter: @vetrivelcsamy, LinkedIn | "Hi Vetrivel, saw your posts about Figma workflow automation. Building automated drift detection. You create plugins—perfect beta tester?" |
| **Jennifer Okafor** | Startup | Figma tokens→npm automation, design systems | Twitter: @jennifer_okafor_, LinkedIn | "Hi Jennifer, saw your post on automating design tokens. Building drift detection tool. Want feedback from a practitioner?" |
| **Ajay Patel** | shadcn/studio | Design systems, Figma→code implementation | Twitter: @ajayp_, LinkedIn | "Hey Ajay, creating Figma→production comparison CLI. shadcn/ui expertise relevant. Want to try?" |
| **Dan Collison** | Various startups | "Build in public", design systems for startups | LinkedIn | "Hi Dan, building Figma→production drift detection. Your startup design system content resonates. Want feedback?" |
| **Martin** | Jam | "How We Use Figma at Our Startup" | Twitter: @jamdotdev | "Saw your Figma content. Building drift detection CLI. Jam uses design systems—relevant?" |
| **Lea Phillips** | Startup consultant | Reports on Figma Schema 2025 updates | LinkedIn | "Hi Lea, saw your posts on Figma updates. Building drift detection. Want feedback?" |
| **Thomas Sutton** | Startup | Figma + AI intersection | LinkedIn | "Hi Thomas, building Figma→production drift detection. Your posts on Figma+AI relevant. Want to try?" |
| **Rolando Fernandez** | 0-1 startup | Design Engineering, token architecture | LinkedIn | "Hi Rolando, building drift detection for design infrastructure. Your token architecture expertise relevant. Want feedback?" |
| **Josh Cusick** | Startup | "Fixing design systems" in Figma | LinkedIn | "Hi Josh, saw your posts on design system maintenance. Building drift detection. Relevant?" |
| **Christopher Nguyen** | Freelance/startup | Design systems for startups | LinkedIn | "Hi Christopher, saw your design system case studies. Building drift detection. Want to try?" |

---

## Outreach Strategy by Platform

### Reddit (Active Communities)

**Subreddits**: r/Figma, r/webdev, r/frontend, r/design, r/javascript, r/reactjs

**Strategy**:
- Reply to posts from last 6 months about design drift
- Focus on "how do you catch drift?" threads
- Offer free beta access, no sales pitch

**Key Threads to Monitor**:
- r/Figma: Daily posts about UI3, Dev Mode issues
- r/webdev: "My implementation looks different than Figma"
- r/frontend: Visual regression testing discussions

**When to Post**:
- After you have 1-2 beta testers with positive feedback
- Share case study: "How [Company X] caught drift before production"

---

### Twitter/X (Direct Outreach)

**Strategy**:
- Reply to viral tweets about "Figma vs Production"
- DM thought leaders in design systems
- Use "student founder" angle (empathy, not salesy)

**Key Hashtags to Monitor**:
- #DesignSystems
- #DesignEngineering
- #Figma
- #VisualRegression
- #DesignOps
- #Frontend

**Best Times to Post/DM**:
- 10am-12pm EST (peak US traffic)
- Avoid weekends (Monday-Thursday optimal)

---

### LinkedIn (Professional Outreach)

**Strategy**:
- Target people by job title: "Design System Lead", "Design Engineer", "Design Ops"
- UMich alumni: Leverage "fellow Wolverine" connection
- Message length: 150-200 characters (concise)

**Connection Request Template**:
```
Hi [Name], fellow UMich alum/student.

I'm building a tool to detect design drift between Figma and live implementations ($20/mo vs $969/mo enterprise tools).

Your work on [specific topic: design systems/parity] is exactly what I'm solving.

Would love 15min feedback call?
```

---

### Figma Community (Organic Discovery)

**Platforms**:
- Figma Forums: https://forum.figma.com/
- Figma Community: https://www.figma.com/community/
- Figma Plugins: https://www.figma.com/community/plugins

**Strategy**:
- Reply to issues about "design doesn't match implementation"
- Offer solution in replies (not spam)
- Build reputation as helpful technical contributor

**Posts to Monitor**:
- "rendering difference" threads
- "UI3 hiding specs" discussions
- Dev Mode efficiency issues

---

### Discord Communities (High-Touch)

**Servers**:
1. **V1 Michigan Discord**: [Link on their website]
2. **Michigan Hackers Discord**: [Link on their website]
3. **SOCHI**: Email outreach
4. **Mintify**: Join their Discord
5. **Figma Community**: Various design-specific Discords

**Strategy**:
- Post in #product-studio, #design-subteam channels
- Be helpful, not spammy
- Respond to questions about design tools
- Share learnings (builds credibility)

---

## Week 1 Outreach Schedule

### Day 1 (Tomorrow)

1. **Reply to Rasmus Schultz** (Figma Forum)
   - Link: https://forum.figma.com/t/rendered-pixels-in-figma-around-8-too-small-versus-chromium/37377
   - Template: Direct reply about 8% rendering discrepancy

2. **Post in V1 Michigan Discord** (#product-studio)
   - Message: "👋 Hey V1 community, I'm building a CLI tool to detect when your live implementation drifts from Figma designs..."

3. **DM @lingodotdev** (Twitter)
   - Handle: @lingodotdev
   - Topic: "Figma vs Production 😂" viral meme
   - Template: "Saw your tweet about Figma vs production gap..."

4. **DM @lewis_healey** (Atlassian)
   - Handle: @lewis_healey
   - Topic: Design-Code Parity
   - Template: "Your work on Figma-code parity is exactly what I'm building. Free beta access?"

5. **Email Stephanie Brenton** (UMSI)
   - Email: stephanib@umich.edu
   - Subject: UMSI Student Seeking Feedback - Design Drift Detection Tool
   - Template: "Hi Stephanie, I'm a UMSI student building a tool to detect design drift between Figma and production..."

### Day 2

6. **Reply to Christian Byrne** (ComfyUI GitHub)
   - Link: https://github.com/Comfy-Org/ComfyUI_frontend/issues/4525
   - Template: "Hey Christian, saw your issue about PackCardSkeleton drift..."

7. **DM @TkDodo** (Sentry Design Engineering)
   - Handle: @TkDodo
   - Topic: "Frankenstein UI"
   - Template: "Your 'Scraps' system approach is perfect for automated drift detection. Want to test?"

8. **Email SOCHI Leadership**
   - Email: sochi@umich.edu
   - Subject: Workshop Opportunity - Design Drift Detection Demo
   - Template: "Hi SOCHI leadership, I'm a UMSI student building a tool for design drift detection..."

9. **Post in Michigan Hackers Discord** (#design-subteam)
   - Message: "👋 Hey Michigan Hackers, I'm building a CLI tool to detect design drift..."

10. **DM @matthew_hall** (Productic)
   - Handle: @matthew_hall
   - Topic: "Product Decay"
   - Template: "Your 'product decay' framework is exactly what I'm solving. Enterprise drift detection for $20/mo vs $969/mo Applitools?"

### Day 3

11. **Reply to Jagadeeshftw** (StelloPay GitHub)
    - Link: https://github.com/Stellopay/stellopay-frontend/issues/130
    - Template: "Your issue listing 'Figma vs. Current' mismatches is EXACTLY what I'm solving..."

12. **Reply to pbrissaud** (Kubeasy GitHub)
    - Link: https://github.com/kubeasy-dev/website/issues/137
    - Template: "Brand dilution is my focus. My tool catches off-brand colors automatically..."

13. **DM @joeyabanks** (Notion DS Consultant)
    - Handle: @joeyabanks
    - Topic: Design systems education
    - Template: "Hi Joey, I'm a student founder building automated drift detection..."

14. **Email Mintify Leadership**
    - Find contact on their website
    - Template: "Hi Mintify, I'm a UMSI student building a tool to detect design drift..."

15. **Reply to KristyleModin** (SAMAHAN GitHub)
    - Link: https://github.com/SAMAHAN-Systems-Development/samahan-frontend/issues/148
    - Template: "Saw your navbar styling issue. My tool catches these mismatches..."

---

## Outreach Templates

### GitHub Issue Reply Template

```
Hey [Username],

Saw your issue about [specific problem: e.g., "8% rendering discrepancy between Figma and Chromium"].

I'm building a CLI tool that compares Figma specs directly to live browser renders to catch these drifts automatically before they reach production.

Would love your feedback - can I DM you a 15min demo?

Built entirely in open source (figma-drift repo).
```

### Twitter/X DM Template

```
Hi @[handle],

Saw your post about [specific topic: e.g., "Figma vs Production 😂" or "Frankenstein UI"].

I'm a UMich student building a CLI tool to detect design drift between Figma and live implementations.

Free beta access for feedback. 15min call, no pitch.

Open source repo: [link to your GitHub]
```

### UMich Alumni Email Template

```
Hi [Name],

I'm a UMich student building a tool to detect design drift between Figma and live implementations.

Given your role [specific role: e.g., "leading Figma Education at UMich" or "Frontend Engineer at Stripe"], I'd value your perspective on whether this is something Figma users/design teams would pay for.

15min call for feedback (no sales pitch, just want to learn from your experience).

Thanks,
[Your Name]
UMich [Year, e.g., '22 or '16]
```

### Student Organization Post Template

```
👋 Hey [community name],

I'm building a CLI tool to detect when your live implementation drifts from Figma designs.

Targeting design system teams and startups who care about brand consistency.

Automates visual regression in CI/CD, $20/mo vs $969/mo enterprise tools.

Looking for 2-3 beta testers. DM me or reply if you're interested in trying it out.

Built entirely in open source (figma-drift repo).
```

### Design System Practitioner DM Template

```
Hi [Name],

Saw your posts/work on [specific topic: e.g., "Design-Code Parity" or "Frankenstein UI"].

Your approach to [specific value: e.g., "closing the gap between Figma and code"] is exactly what I'm building.

Free beta access for 10min feedback call?

Open source: [GitHub link]
```

---

## Key Insights for Outreach

### What Makes Someone Respond?

1. **Personalization**: Reference their specific post/issue/work
2. **Relevance**: Explain why their situation is relevant to what you're building
3. **Low Friction**: 15min call, no long forms, no account signup required
4. **Student-Founder Empathy**: Be honest "I'm learning", not "I'm selling"
5. **Value-First**: Focus on their problem, not your product features

### What Causes People to Ignore?

1. Generic outreach: "I built a tool for design drift, want to try?"
2. No personalization: Copy-paste messages
3. No value alignment: Messaging people who don't care about design systems
4. Long messages: People don't read past first sentence
5. Sales-y: "This is a game-changer! Buy now!" (student founders can't pull this off)

### The "Build in Public" Approach (No Hype)

**DO share**:
- GitHub commits (technical progress)
- Technical blog posts (what you learned)
- Open source work (proves you can ship)

**DO NOT share**:
- "We have 2 presales customers!" (You don't)
- "People are paying us!" (Premature)
- "We're launching soon!" (Marketing fluff)

**Your narrative**: "I built this because I saw [X specific bug/GitHub issue/Tweet] and wanted to solve it."

### When People Ask "Do You Have Customers?"

**HONEST response**:
```
No. I built this open source because I was researching design drift and found [X evidence of problem].

No presales yet. Looking for 2-3 beta testers to validate before launching anything paid.

My goal: Learn whether design system teams would pay $20/mo for automated drift detection vs. $969/mo for enterprise tools.
```

---

## Success Criteria for Week 1

### Outreach Metrics
- [ ] 25+ outreach actions completed
- [ ] 10+ responses received
- [ ] 5+ feedback calls scheduled
- [ ] 2-3 people agree to beta test

### Validation Criteria
- [ ] At least 2 people run tool on their Figma + staging environment
- [ ] At least 1 person says "Yes, I would pay $20/mo for this"
- [ ] Document friction points (what's hard about current workflow)

### Learning Criteria
- [ ] Understand why people say "no" (too expensive? don't trust student? wrong ICP?)
- [ ] Identify feature gaps (what's missing?)
- [ ] Refine ICP based on feedback

---

## Next Steps After Week 1

If validation successful:
- Update EVALUATION.md with customer feedback
- Refine pricing based on willingness-to-pay data
- Build MVP features based on requested gaps
- Start presale outreach (design system leads, enterprises)

If validation fails:
- Document reasons for "no" responses
- Re-evaluate ICP (wrong segment?)
- Consider pivot (different problem? different approach?)

---

## Additional Platforms to Monitor

### Product Hunt
- Launch day: After 2-3 beta testers + demo video
- Community: Makers, indie hackers, design system enthusiasts

### Hacker News
- Post: Show project with before/after visual proof
- Timing: Weekday mornings (EST)

### Dev.to / Medium
- Articles: Technical deep-dives on design drift problem
- Topics: Why snapshot-based tools fail, Figma-first approach advantages

### Indie Hackers
- Community: Solo founders shipping side projects
- Relevance: Many building design tools or integrations

---

## Quick Reference: Who to Reach When

| Scenario | Who to Target | Message Angle |
|----------|----------------|----------------|
| **Someone posts about Figma rendering issue** | Rasmus Schultz (and others) | "My tool catches these rendering differences automatically" |
| **Someone tweets 'Figma vs Production 😂'** | @lingodotdev | "Saw your viral meme—building automated solution" |
| **UMich alum at design-forward company** | Abigail Ng, Max Yinger, etc. | "Fellow Wolverine building tool to help Figma workflows" |
| **Design system lead writes about governance** | Rauno Freiberg, Lee Munroe | "Your work on design ops is exactly what I'm automating" |
| **Junior designer posts about Figma automation** | Vetrivel, Jennifer Okafor | "Building drift detection—perfect for your Figma workflow" |

---

## Resources

### Your Repositories
- Main: [figma-drift](https://github.com/[username]/figma-drift) (add your username when live)
- Updates: Commit regularly with technical progress

### Figma API Resources
- Docs: https://www.figma.com/developers/api
- REST API: Verified
- Variables API: Enterprise-only limitation noted

### Research Sources
- This guide based on 10 parallel research streams (Jan 2026)
- All sources verified and cited

---

**Status**: Ready to execute Week 1 outreach starting [TOMORROW DATE].
