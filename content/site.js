/* =====================================================================
   SITE CONTENT
   Every word, link and picture on the site lives in this file.
   Edit, save, refresh.

   Text supports **bold**, *italic* and [links](https://example.com).
   Leave a url empty ("") to show an item without a link.
   An empty list hides its section, and its link in the menu.
   ===================================================================== */

window.SITE = {
  meta: {
    title: "Fahad Alsehami",
    description:
      "Fahad Alsehami works on consciousness and brain decoding, with a neuroscience-informed approach to engineering intelligence. He founded Medera and co-founded BOTIM.",
    url: "https://fahadama.info",
  },

  person: {
    name: "Fahad Alsehami",
    firstName: "Fahad",
    location: "San Francisco, California",
    portrait: {
      // A cut-out photo (transparent background), shown in one tone inside a round sky frame.
      src: "content/images/portrait.webp",
      alt: "Portrait of Fahad Alsehami",
    },
  },

  hero: {
    intro: "I work on consciousness and brain decoding, with a neuroscience-informed approach to engineering intelligence.",
  },

  /* ---------------- About ---------------- */
  about: {
    lead: "What drives me:",
    statement: "understanding intelligence and engineering it are one endeavor.",
    paragraphs: [
      "I study how internal states such as arousal, feeling and the sense of self arise in the brain, and how they surface in the voice, face, heart and breath. My current proposal, [*Reading the Mind from the Body*](#projects/reading-the-mind), would record those signals alongside deep-brain activity, so they can be checked against the brain itself.",
      "What the brain teaches shapes what I build. At [Medera](https://www.medera.info), which I founded, I built vocal, facial and physiological biomarkers mapped to the brain's research domains (RDoC), and clinical speech recognition in English and Arabic. In my own research I build vision transformers that see an image as parts rather than a grid, and I certify what language models may claim.",
      "Before that I co-founded BOTIM. I write about verifying AI for the mind in [Signal & Symptom](https://alsehami.substack.com).",
    ],
    facts: [
      { label: "Focus", value: "Consciousness, brain decoding and neuroscience-informed AI" },
      { label: "Education", value: "M.S. Bioinformatics, University of San Francisco" },
      { label: "Languages", value: "Arabic and English" },
      { label: "Recognition", value: "[MIT Hacking Medicine Grand Prize, New York 2018](#talks/mit-hacking-medicine)" },
    ],
  },

  /* ---------------- Experience ----------------
     One entry per role, newest first. logo: a square image (about 176 x 176)
     shown beside the title, or { mark: "UCSF" } for a lettered tile. */
  experience: [
    {
      dates: "2024 – Present",
      title: "Founder & CEO",
      org: "Medera",
      orgUrl: "https://www.medera.info",
      place: "San Francisco",
      logo: { src: "content/logos/medera.png", alt: "Medera logo" },
      detail:
        "Building the AI co-therapy OS for behavioral health: patent-pending, and built to SOC 2 Type II, HIPAA and GDPR.",
    },
    {
      dates: "Mar 2021 – Oct 2021",
      title: "Data Scientist Intern",
      org: "UCSF Health Hub",
      orgUrl: "",
      place: "San Francisco",
      logo: { mark: "UCSF" },
      detail:
        "Analyzed and managed the entries, judges and categories in Award Force for the 3rd annual UCSF Health Awards (formerly the UCSF Digital Health Awards): more than 1,200 submissions in 16 categories, scored by more than 450 judges over three rounds.",
    },
    {
      dates: "Feb 2016 – Dec 2019",
      title: "Co-founder and Chief Product Officer",
      org: "BOTIM",
      orgUrl: "https://www.botim.me",
      place: "San Francisco – Dubai",
      logo: { src: "content/logos/botim.png", alt: "BOTIM logo" },
      detail:
        "A video and voice calling app developed by Algento, a San Francisco mobile-technology company. I co-founded it and led its product.",
    },
    {
      dates: "Feb 2015 – Dec 2015",
      title: "Business Development Manager (Middle East)",
      org: "SOMA Messenger",
      orgUrl: "",
      place: "San Francisco",
      logo: { mark: "SOMA" },
      detail:
        "Managed VoIP partnerships with Gulf mobile operators for Instanza's HD video, voice and messaging app, which reached 10 million users within 30 days of launch, and designed the peer-to-peer payment infrastructure for a mobile payment product built on a white-label version of it, which won regulatory approval in Saudi Arabia.",
    },
  ],

  /* ---------------- Projects ----------------
     media: { image, alt, tone } shows a screenshot rising out of a coloured mat.
     tone sets the mat: "sky", "lilac", "mint", "blue" or "paper".
     Work with no public screenshot yet can use media: "complex" instead,
     a cell complex drawn live. Link to an item with #projects/<id>. */
  projects: {
    title: "Selected work",
    note: "Research in progress, and things I've built and shipped :)",
    items: [
      {
        id: "reading-the-mind",
        eyebrow: "Research proposal, in progress",
        title: "Reading the Mind from the Body",
        url: "",
        detail:
          "Feelings leave traces in the body: heart rhythm, voice, face, breath, skin and eyes. This study records them alongside deep-brain activity in people already undergoing epilepsy monitoring, maps which brain circuit drives which body signal, how strongly and how fast, and links each to the research dimensions of mental health (RDoC). The goal is an open readout model that learns from the brain, then runs on the body alone and says how certain it is.",
        tags: ["Neuroscience", "Multimodal biomarkers", "In progress"],
        // A narrated video: the poster shows until the visitor presses Play. `length` labels the button.
        media: { video: "content/projects/reading-the-mind.mp4", poster: "content/projects/reading-the-mind.webp", length: "2:54", alt: "Reading the Mind from the Body: a short animated explainer of how the brain and the body signal each other", tone: "blue" },
      },
      {
        id: "perimeter",
        eyebrow: "Independent research in computer vision",
        title: "Perimeter",
        url: "",
        detail:
          "A vision transformer that reads an image as its parts, not as a grid of squares: each picture becomes an oriented cell complex of regions, and one signed pass along the region borders gives every region's exact area, centre and spread. In a CPU pilot on Imagewoof, region tokens beat patch tokens on all three seeds (64.7% vs 62.8% top-1) with 69% of the compute.",
        tags: ["Vision transformers", "Topological deep learning", "In progress"],
        media: { video: "content/projects/perimeter.mp4", poster: "content/projects/perimeter.webp", length: "11:05", alt: "Perimeter, explained: an animated walkthrough of how the model reads a picture as regions joined by signed borders, and what the experiment found", tone: "blue" },
      },
      {
        id: "cello",
        eyebrow: "Independent research in topological deep learning",
        title: "CELLO",
        url: "",
        detail:
          "Vision transformers on oriented cell complexes: each block passes messages between image patches, their adjacencies and 2 × 2 squares, so the model sees how patches are arranged, not only which belong together. On CIFAR-10 it reaches 89.54% at about 0.1 GMACs, against at most 88.56% for ViT and HgVT (one seed so far), and early exits certified with Learn-then-Test cut compute 2.18×.",
        tags: ["Topological deep learning", "Vision transformers", "In progress"],
        media: "complex", // a turning cell complex, drawn live; swap for a screenshot once results are public
      },
      {
        id: "hallucination-guard",
        eyebrow: "Medera research, in progress",
        title: "Hallucination guard",
        url: "https://alsehami.substack.com/p/the-epistemological-crisis-of-llms",
        detail:
          "An end-to-end hallucination-detection and consensus layer that checks open-source models alongside Claude, OpenAI and Grok, modeled on Vectara's HHEM. My manuscript *Certify the Gate, Not the Generator* certifies which claims may reach a reader: on 81,414 MedLFQA claims it keeps 77.8% at a 3% unsupported rate. I wrote about the problem it tackles in Signal & Symptom.",
        tags: ["Multi-LLM", "Verification", "Open source"],
        media: { image: "content/projects/hallucination-essay.webp", alt: "The Signal & Symptom essay on LLM hallucination detection in psychiatry", tone: "paper" },
      },
      {
        id: "bh-asr",
        eyebrow: "Open benchmark from Medera",
        title: "Medera BH-ASR",
        url: "https://huggingface.co/Medera/medera-bh-asr",
        detail:
          "Speech recognition for behavioral-health conversations in English and Arabic. It sits at the top of a public 13-recognizer leaderboard for English consultations and invents no drug names under a medication prompt. Now extending to Arabic dialects, Persian, Spanish and Mandarin.",
        tags: ["English", "Arabic", "Hugging Face"],
        media: { image: "content/projects/bh-asr-leaderboard.webp", alt: "The behavioral-health speech recognition leaderboard, with Medera BH-ASR Pro first of 13 recognizers", tone: "lilac" },
      },
      {
        id: "co-therapy",
        eyebrow: "Built at Medera",
        title: "Co-therapy OS",
        url: "https://www.medera.info/clinical/agents",
        detail:
          "23 agents carry the work around every therapy session, from the intake packet to the claim, kept in step by a Care Orchestrator. A clinician approves every step.",
        tags: ["Multi-agent", "FHIR R4", "Clinician in the loop"],
        media: { image: "content/projects/co-therapy-os.webp", alt: "The Medera agents page: Meet the team around every session", tone: "sky" },
      },
      {
        id: "glass",
        eyebrow: "EHR write-back at Medera",
        title: "Medera Glass",
        url: "https://www.medera.info/clinical/platform/glass",
        detail:
          "Agents sign in to the EHR a practice already runs and file the notes, codes, scores and letters, the way a careful colleague would. No interface project, no copy-paste.",
        tags: ["Browser agents", "EHR", "Audit log"],
        media: { image: "content/projects/medera-glass.webp", alt: "The Medera Glass page: Your chart, already up to date", tone: "mint" },
      },
      {
        id: "explainers",
        eyebrow: "Explainer videos for Medera",
        title: "Seven explainers",
        url: "https://huggingface.co/Medera/medera-bh-asr#explainers",
        detail:
          "Short animations, captioned in English and Arabic, that explain BH-ASR's safety numbers without the math: why recall is the product of two gates, how evidence adds in log-odds, what an interval can and cannot prove, and why a voice is best measured against its own baseline.",
        tags: ["Animation", "English and Arabic", "Hugging Face"],
        media: { image: "content/projects/explainers.webp", alt: "A frame from the Two gates explainer: recall is the product of the two gates", tone: "paper" },
      },
      {
        id: "botim",
        eyebrow: "Co-founded, acquired in 2023",
        title: "BOTIM",
        url: "https://www.botim.me",
        detail:
          "The Middle East's first VoIP unicorn: 90 million registered users and 80% penetration in the UAE by 2023, when G42-backed Astra Tech acquired it alongside a $500M round led by G42.",
        tags: ["VoIP", "Consumer", "UAE"],
        media: { image: "content/projects/botim.webp", alt: "The BOTIM website today: love talks, money moves, all on botim", tone: "blue" },
      },
      {
        id: "signal-and-symptom",
        eyebrow: "Writing since 2025",
        title: "Signal & Symptom",
        url: "https://alsehami.substack.com",
        detail:
          "Where AI engineering meets clinical reality: essays on building, verifying and safely deploying intelligent systems in behavioral health.",
        tags: ["Substack", "Essays"],
        media: { image: "content/projects/signal-and-symptom.webp", alt: "The Signal & Symptom publication on Substack", tone: "lilac" },
      },
    ],
  },

  /* ---------------- Talks & prizes ----------------
     Each item: { id, year, place, title, role, detail, badge, photos }.
     photos: [{ src, alt, caption, width, height }]. The first photo is shown large;
     a second one overlaps its corner. badge is the pill on the first photo.
     Link to an item with #talks/<id>. */
  talks: {
    title: "Talks & prizes",
    note: "Where I've spoken, won and judged :)",
    items: [
      {
        id: "mit-hacking-medicine",
        year: "2018",
        place: "New York City",
        title: "Grand Prize, MIT Hacking Medicine",
        role: "Speaker and Grand Prize winner",
        detail: "Spoke on stage at MIT Hacking Medicine in New York City and won the Grand Prize.",
        badge: "Grand Prize",
        photos: [
          {
            src: "content/talks/mit-hacking-medicine-stage.webp", width: 880, height: 1100,
            alt: "Fahad speaking into a microphone in front of the MIT Hacking Medicine and Mount Sinai banners",
            caption: "On stage, NYC",
          },
          {
            src: "content/talks/mit-hacking-medicine-team.webp", width: 1100, height: 733,
            alt: "Fahad with four others, all wearing event badges, in front of the MIT Hacking Medicine banners",
            caption: "MIT Hacking Medicine, 2018",
          },
        ],
      },
      {
        id: "regeneron-isef",
        year: "2024",
        place: "Los Angeles",
        title: "Grand Award Judge, Regeneron ISEF",
        role: "Volunteer judge, Behavioral and Social Sciences",
        detail: "Served as a volunteer Grand Award Judge at Regeneron ISEF 2024, the International Science and Engineering Fair, in Los Angeles, assigned to the Behavioral and Social Sciences category.",
        badge: "Judge",
        photos: [
          {
            src: "content/talks/regeneron-isef-2024.webp", width: 605, height: 330,
            alt: "Regeneron ISEF 2024, Los Angeles: a program of Society for Science",
            caption: "Los Angeles, 2024",
          },
        ],
      },
      // Items without photos are listed one line each, under the others.
      { id: "rad-global-forum", year: "2020", place: "Beverly Hills", title: "Speaker, RAD Global Forum" },
      { id: "misk-hackathon", year: "2016", place: "Riyadh", title: "Runner-up, MiSK Hackathon" },
    ],
  },

  /* ---------------- Interests ----------------
     figure picks the 3D figure made of points: network, camera, tennis, mountain, bike or people.
     project links the tile to a project by its id. Link to a tile with #interests/<id>. */
  interests: {
    title: "Interests",
    note: "Six things I love outside of work.",
    items: [
      {
        id: "social-science",
        label: "Social science",
        figure: "network",
        text: "Thinking about the next generation of social science, where politics is read as a social graph: who holds influence, how trust and attention spread, and how network effects decide which ideas, leaders and movements win.",
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
    note: "Always happy to talk AI, health and startups.",
    items: [
      // Add your email to show a Copy button: { label: "Email", value: "you@example.com", url: "mailto:you@example.com", copy: true },
      { label: "Substack", value: "Signal & Symptom", url: "https://alsehami.substack.com" },
      { label: "Company", value: "medera.info", url: "https://www.medera.info" },
    ],
  },
};
