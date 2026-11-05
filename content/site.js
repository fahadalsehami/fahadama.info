/* =====================================================================
   SITE CONTENT
   Every word, link and picture on the site lives in this file.
   Edit, save, refresh.

   Text supports **bold**, *italic* and [links](https://example.com).
   Leave a url empty ("") to show an item without a link.
   Empty lists hide their tab (for example the Bookshelf until you add books).
   ===================================================================== */

window.SITE = {
  meta: {
    title: "Fahad Alsehami",
    description:
      "Fahad Alsehami is a serial entrepreneur: founder of Medera AI, the AI co-therapy OS for behavioral health, and co-founder of BOTIM.",
    url: "https://fahadama.info",
  },

  person: {
    name: "Fahad Alsehami",
    firstName: "Fahad",
    location: "San Francisco, California",
    portrait: {
      // A cut-out photo (transparent background) sits in the round frame.
      src: "content/images/portrait.webp",
      alt: "Portrait of Fahad Alsehami",
      // Optional: nine photos looking in different directions make the portrait
      // follow the pointer. Add files and paths here, e.g. up: "content/images/pose-up.webp".
      // Keys: center, up, down, left, right, upLeft, upRight, downLeft, downRight.
      poses: {},
    },
  },

  hero: {
    greeting: "Hello! I'm Fahad",
    intro: "I'm a serial entrepreneur and product builder working where AI meets behavioral health.",
  },

  /* ---------------- About ---------------- */
  about: {
    lead: "What I do:",
    statement: "build from zero to scale, take research into the clinic, and make AI earn trust.",
    paragraphs: [
      "I'm the founder of [Medera AI](https://www.medera.info), the AI co-therapy OS for behavioral health. Before Medera I co-founded BOTIM and worked on its product; it became the Middle East's first VoIP unicorn and was acquired in 2023 by G42-backed Astra Tech, alongside a $500M round led by G42.",
      "At Medera our agents carry the work around every therapy and primary-care session, from the intake packet to the claim, and nothing is filed without a clinician's review. I work across multi-agent orchestration, clinical speech recognition in English and Arabic, multimodal biomarkers, and FHIR and HL7 interoperability.",
      "I care about verification: the layers that make language models safe enough for psychiatry. I write about it in [Signal & Symptom](https://alsehami.substack.com).",
      "In 2018 I won the MIT Grand Prize in New York.",
    ],
    facts: [
      { label: "Currently", value: "Medera AI, founder" },
      { label: "Working across", value: "AI, behavioral health, speech" },
      { label: "Previously", value: "BOTIM, co-founder and product" },
      { label: "Recognition", value: "MIT Grand Prize, New York 2018" },
    ],
    emblem: { kind: "laurel", label: "2018" }, // drawn in particles under the facts
  },

  /* ---------------- Experience ----------------
     logo: a square image (about 176 x 176) shown beside the dates. */
  experience: [
    {
      dates: "Present",
      title: "Founder",
      org: "Medera AI",
      orgUrl: "https://www.medera.info",
      place: "San Francisco",
      logo: { src: "content/logos/medera.png", alt: "Medera logo" },
      detail:
        "Building the AI co-therapy OS for behavioral health: 23 clinical agents, the BH-ASR speech model with its public 13-recognizer leaderboard, Medera Glass for EHR write-back, and a patent-pending multimodal co-therapy engine, built to SOC 2 Type II, HIPAA and GDPR.",
    },
    {
      dates: "Mar 2025 — Present",
      title: "Writer",
      org: "Signal & Symptom",
      orgUrl: "https://alsehami.substack.com",
      place: "Substack",
      logo: { src: "content/logos/substack.png", alt: "Substack logo" },
      detail:
        "Started writing about building agentic AI to rewire mental healthcare, then turned to the epistemological crisis of LLMs in psychiatry: how to detect hallucinations, and why dynamical systems theory offers a way forward.",
    },
    {
      dates: "2018",
      title: "Grand Prize Winner",
      org: "MIT",
      orgUrl: "",
      place: "New York",
      logo: { src: "content/logos/award.svg", alt: "" },
      detail: "Won the MIT Grand Prize in New York City.",
    },
    {
      dates: "2017",
      title: "Co-founder and Product",
      org: "BOTIM",
      orgUrl: "https://www.botim.me",
      place: "UAE",
      logo: { src: "content/logos/botim.png", alt: "BOTIM logo" },
      detail:
        "Co-founded BOTIM and worked on its product. It grew into the Middle East's first VoIP unicorn with 90 million registered users by 2023, when G42-backed Astra Tech acquired it alongside a $500M round led by G42.",
    },
  ],

  /* ---------------- Projects ----------------
     media: { image, alt, tone } shows a screenshot in a window frame.
     tone sets the backdrop: "sky", "mint", "lilac", "blue", "paper" or "rust".
     Work with no public screenshot yet can use a drawn card instead:
     "complex" (a cell complex), "network" (a stance network), "session",
     "leaderboard", "chart", "globe" or "consensus". */
  projects: {
    title: "Selected work",
    note: "Things I've built and shipped :)",
    items: [
      {
        id: "co-therapy",
        eyebrow: "Medera · Founder",
        title: "Co-therapy OS",
        url: "https://www.medera.info/agents",
        detail:
          "23 agents carry the work around every therapy session, from the intake packet to the claim, kept in step by a Care Orchestrator. A clinician approves every step.",
        tags: ["Multi-agent", "FHIR R4", "Clinician in the loop"],
        media: { image: "content/projects/co-therapy-os.webp", alt: "The Medera agents page: Meet the team around every session", tone: "sky" },
      },
      {
        id: "bh-asr",
        eyebrow: "Medera · Open benchmark",
        title: "Medera BH-ASR",
        url: "https://huggingface.co/Medera/medera-bh-asr",
        detail:
          "Speech recognition for behavioral-health conversations in English and Arabic. It sits at the top of a public 13-recognizer leaderboard for English consultations and invents no drug names under a medication prompt.",
        tags: ["English", "Arabic", "Hugging Face"],
        media: { image: "content/projects/bh-asr-leaderboard.webp", alt: "The behavioral-health speech recognition leaderboard, with Medera BH-ASR Pro first of 13 recognizers", tone: "lilac" },
      },
      {
        id: "glass",
        eyebrow: "Medera · EHR write-back",
        title: "Medera Glass",
        url: "https://www.medera.info/platform/glass",
        detail:
          "Agents sign in to the EHR a practice already runs and file the notes, codes, scores and letters, the way a careful colleague would. No interface project, no copy-paste.",
        tags: ["Browser agents", "EHR", "Audit log"],
        media: { image: "content/projects/medera-glass.webp", alt: "The Medera Glass page: Your chart, already up to date", tone: "mint" },
      },
      {
        id: "explainers",
        eyebrow: "Medera · Explainers",
        title: "Seven explainers",
        url: "https://huggingface.co/Medera/medera-bh-asr#explainers",
        detail:
          "Short animations, captioned in English and Arabic, that explain BH-ASR's safety numbers without the math: why recall is the product of two gates, how evidence adds in log-odds, what an interval can and cannot prove, and why a voice is best measured against its own baseline.",
        tags: ["Animation", "English and Arabic", "Hugging Face"],
        media: { image: "content/projects/explainers.webp", alt: "A frame from the Two gates explainer: recall is the product of the two gates", tone: "paper" },
      },
      {
        id: "hallucination-guard",
        eyebrow: "Medera research · In progress",
        title: "Hallucination guard",
        url: "https://alsehami.substack.com/p/the-epistemological-crisis-of-llms",
        detail:
          "An end-to-end hallucination-detection and consensus layer that checks open-source models alongside Claude, OpenAI and Grok, modeled on Vectara's HHEM. I wrote about the problem it tackles in Signal & Symptom.",
        tags: ["Multi-LLM", "Verification", "Open source"],
        media: { image: "content/projects/hallucination-essay.webp", alt: "The Signal & Symptom essay on LLM hallucination detection in psychiatry", tone: "paper" },
      },
      {
        id: "cello",
        eyebrow: "Independent research · Topological deep learning",
        title: "CELLO",
        url: "",
        detail:
          "My own graph learning architecture and training algorithm, built on topological deep learning: it learns from higher-order structure, cells as well as nodes and edges, and is aimed at the top of public graph benchmarks. Trained end to end on NVIDIA A100 GPUs.",
        tags: ["Topological deep learning", "Graph learning", "In progress"],
        media: "complex", // a cell complex drawn in particles; swap for a screenshot once results are public
      },
      {
        id: "marsad",
        eyebrow: "Research agent · Social science",
        title: "Marsad",
        url: "",
        detail:
          "A research agent that reads X as a social graph. From one prompt it finds the accounts and Spaces that matter, labels harmful content with Arabic and English language and image analysis, and maps the network: communities, bridges, influence, and each account's stance on a topic, pro, con or neutral, over time. Private accounts stay pseudonymous, and every identity shown is audit-logged.",
        tags: ["Arabic + English NLP", "Network science", "Bilingual console"],
        media: "network", // drawn in Marsad's own console style, with no real accounts
      },
      {
        id: "botim",
        eyebrow: "Co-founder · Acquired 2023",
        title: "BOTIM",
        url: "https://www.botim.me",
        detail:
          "Co-founded and worked on product at the Middle East's first VoIP unicorn: 90 million registered users by 2023, when G42-backed Astra Tech acquired it alongside a $500M round led by G42.",
        tags: ["VoIP", "Consumer", "UAE"],
        media: { image: "content/projects/botim.webp", alt: "The BOTIM website today: love talks, money moves, all on botim", tone: "blue" },
      },
      {
        id: "signal-and-symptom",
        eyebrow: "Writing · Since 2025",
        title: "Signal & Symptom",
        url: "https://alsehami.substack.com",
        detail:
          "Where AI engineering meets clinical reality: essays on building, verifying and safely deploying intelligent systems in behavioral health.",
        tags: ["Substack", "Essays"],
        media: { image: "content/projects/signal-and-symptom.webp", alt: "The Signal & Symptom publication on Substack", tone: "lilac" },
      },
    ],
  },

  /* ---------------- Bookshelf ----------------
     Add books to show the Bookshelf tab. Each book:
     { title: "", author: "", note: "One or two lines on why it matters to you.",
       color: "#2f4a8a", accent: "#e8b04b", height: 1, width: 1 }   (height/width are optional, around 0.8–1.15) */
  books: {
    title: "On the shelf: networks, minds, machines and building companies.",
    hint: "Hover to preview. Drag to browse. Select a book to open it.",
    // A starter shelf: swap in your own books, notes and colours.
    items: [
      {
        title: "The Cold Start Problem", author: "Andrew Chen",
        note: "How networks start, tip and defend themselves: the playbook behind messaging apps and marketplaces.",
        color: "#1F3A8A", accent: "#F2C14E", height: 1.02,
      },
      {
        title: "Connected", author: "Nicholas A. Christakis & James H. Fowler",
        note: "How behaviour, health and ideas spread through social networks, three degrees out.",
        color: "#C9472D", accent: "#F4E3C6", height: 0.92, font: "serif",
      },
      {
        title: "Graph Representation Learning", author: "William L. Hamilton",
        note: "A clear path from node embeddings to graph neural networks, the ground topological deep learning builds on.",
        color: "#E9E4D6", accent: "#2F6B5A", height: 1.08,
      },
      {
        title: "The Alignment Problem", author: "Brian Christian",
        note: "Why models learn what we measure rather than what we meant, and what it takes to trust them.",
        color: "#151515", accent: "#E8DCC2", height: 1.0,
      },
      {
        title: "The Signal and the Noise", author: "Nate Silver",
        note: "Prediction, uncertainty and calibration: knowing which numbers to believe.",
        color: "#F3D046", accent: "#1C1A17", height: 1.1,
      },
      {
        title: "Thinking in Systems", author: "Donella H. Meadows",
        note: "Stocks, flows and feedback loops: the plainest way into dynamical systems.",
        color: "#2E6B47", accent: "#EBD9A8", height: 0.98, font: "serif",
      },
      {
        title: "The Body Keeps the Score", author: "Bessel van der Kolk",
        note: "Trauma, the body and the long road of treatment: the clinical world behavioral-health AI has to serve.",
        color: "#3B5BA9", accent: "#F2A07B", height: 1.12,
      },
      {
        title: "Zero to One", author: "Peter Thiel",
        note: "Notes on building something new instead of copying what works.",
        color: "#E7E2D8", accent: "#3A6EA5", height: 0.9,
      },
    ],
  },

  /* ---------------- Interests ---------------- */
  interests: {
    title: "Interests",
    note: "Six things I love outside of work, each one built from particles. Pick one :)",
    items: [
      {
        id: "social-science",
        label: "Social science",
        figure: "network",
        text: "Thinking about the next generation of social science, where politics is read as a social graph: who holds influence, how trust and attention spread, and how network effects decide which ideas, leaders and movements win.",
        project: "marsad", // links to that card in Projects
        photos: [], // e.g. [{ src: "content/photos/hike-1.webp", caption: "Mission Peak" }]
      },
      {
        id: "explainers",
        label: "Explainers",
        figure: "camera",
        text: "I make plain-language explainer videos for curious people who would rather skip the math.",
        project: "explainers",
        photos: [],
      },
      {
        id: "tennis",
        label: "Tennis",
        figure: "tennis",
        text: "Time on court, away from screens.",
        photos: [],
      },
      {
        id: "hiking",
        label: "Hiking",
        figure: "mountain",
        text: "Trails, climbs and long views.",
        photos: [],
      },
      {
        id: "road-cycling",
        label: "Road cycling",
        figure: "bike",
        text: "Long rides on open roads.",
        photos: [],
      },
      {
        id: "networking",
        label: "Networking",
        figure: "people",
        text: "I enjoy networking and meeting new people.",
        photos: [],
      },
    ],
  },

  /* ---------------- Play Me ---------------- */
  play: {
    title: "Play Me",
    note: "Tennis against me. Angle the ball off the edge of your racket, but not too wide. Four points, two clear, takes the game. Good luck :)",
  },

  /* ---------------- Contact ---------------- */
  contact: {
    title: "Say hello",
    note: "always happy to talk AI, health and startups.",
    items: [
      // Add your email to show a Copy button: { label: "Email", value: "you@example.com", url: "mailto:you@example.com", copy: true },
      { label: "Substack", value: "Signal & Symptom", url: "https://alsehami.substack.com" },
      { label: "Company", value: "medera.info", url: "https://www.medera.info" },
    ],
  },
};
