/* =====================================================================
   SITE CONTENT
   Every word, link and picture on the site lives in this file.
   Edit, save, refresh.

   Text supports **bold**, *italic* and [links](https://example.com).
   Leave a url empty ("") to show an item without a link.
   An empty list hides its section (for example the Bookshelf until you add books).
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
      { label: "Education", value: "M.S. Digital Health Informatics, University of San Francisco" },
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

  /* ---------------- Bookshelf ----------------
     Add books to show the Bookshelf. Each book:
     { title: "", author: "", note: "A line about the book, or why it matters to you.",
       color: "#2f4a8a", accent: "#e8b04b", height: 1, width: 1 }
     Optional: ink (spine text colour), font: "serif", spineTitle / spineAuthor
     (shorter text for the spine only), reading: true (show that book first),
     cover: "content/books/…" (a real cover image). height/width run about 0.75–1.15 and 0.7–1.4. */
  books: {
    title: "On the shelf: machine learning, statistics, history and power.",
    hint: "Hover to preview. Drag to browse. Select a book to open it.",
    // Each note is the book's own subtitle or edition. Replace any with your own words.
    items: [
      // Machine learning and the math beneath it
      {
        title: "Deep Learning", author: "Ian Goodfellow, Yoshua Bengio & Aaron Courville",
        note: "",
        color: "#B9C4CF", accent: "#3E4B5B", ink: "#27303A", height: 1.1, width: 1.35,
      },
      {
        title: "Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow", author: "Aurélien Géron",
        note: "Concepts, Tools, and Techniques to Build Intelligent Systems. Second edition.",
        color: "#F2F0EA", accent: "#D2332B", ink: "#1C1C1C", height: 1.08, width: 1.3,
      },
      {
        title: "Reinforcement Learning", author: "Richard S. Sutton & Andrew G. Barto",
        note: "An Introduction. Second edition.",
        color: "#ECEBE7", accent: "#2F6FB1", ink: "#3A3A3A", height: 1.1, width: 1.2,
      },
      {
        title: "Deep Reinforcement Learning Hands-On", author: "Maxim Lapan",
        note: "Second edition.",
        color: "#1D1D1F", accent: "#E8742C", ink: "#F4F0E8", height: 1.05, width: 1.25,
      },
      {
        title: "Understanding Machine Learning", author: "Shai Shalev-Shwartz & Shai Ben-David",
        note: "From Theory to Algorithms.",
        color: "#8C2E29", accent: "#F1E3C8", height: 1.04, width: 1.05,
      },
      {
        title: "Bayesian Reasoning and Machine Learning", author: "David Barber",
        note: "",
        color: "#D63A50", accent: "#F4D44D", ink: "#F7DA55", height: 1.1, width: 1.25,
      },
      {
        title: "An Introduction to Statistical Learning", author: "Gareth James, Daniela Witten, Trevor Hastie & Robert Tibshirani",
        note: "With Applications in R.",
        color: "#E9BA25", accent: "#1F2F5C", ink: "#1F2F5C", height: 1.05, width: 1.05,
      },
      {
        title: "Statistical Inference", author: "George Casella & Roger L. Berger",
        note: "Second edition.",
        color: "#3A1F23", accent: "#D8344A", height: 1.05, width: 1.15,
      },
      {
        title: "Practical Statistics for Data Scientists", author: "Peter Bruce & Andrew Bruce",
        note: "50 Essential Concepts.",
        color: "#C9342F", accent: "#F4F0E8", height: 1.0, width: 0.9,
      },
      {
        title: "Python Data Science Handbook", author: "Jake VanderPlas",
        note: "Essential Tools for Working with Data.",
        color: "#CE3F2C", accent: "#F3E6D3", height: 1.0, width: 1.1,
      },
      {
        title: "Linear Algebra and Its Applications", author: "Gilbert Strang",
        note: "Fourth edition.",
        color: "#F1EFE9", accent: "#D4483A", ink: "#24365F", height: 1.05, width: 0.95,
      },
      {
        title: "R in Action", author: "Robert I. Kabacoff",
        note: "Data Analysis and Graphics with R. Second edition.",
        color: "#B8B896", accent: "#B83A2E", ink: "#1E1E1E", height: 1.0, width: 1.05,
      },
      {
        title: "Artificial Intelligence", author: "Nils J. Nilsson",
        note: "A New Synthesis.",
        color: "#4A2D80", accent: "#E7E1F4", height: 1.04, width: 1.0,
      },
      // AI and people
      {
        title: "The Book of Why", author: "Judea Pearl & Dana Mackenzie",
        note: "The New Science of Cause and Effect.",
        color: "#E46C3E", accent: "#FBE4C8", height: 0.98, width: 0.95,
      },
      {
        title: "Deep Thinking", author: "Garry Kasparov with Mig Greengard", spineAuthor: "Kasparov",
        note: "Where Machine Intelligence Ends and Human Creativity Begins.",
        color: "#E15A35", accent: "#262626", height: 0.98, width: 0.9,
      },
      {
        title: "Human + Machine", author: "Paul R. Daugherty & H. James Wilson",
        note: "Reimagining Work in the Age of AI.",
        color: "#C9346F", accent: "#F7C948", height: 1.0, width: 0.85,
      },
      {
        title: "Deep Medicine", author: "Eric Topol",
        note: "How Artificial Intelligence Can Make Healthcare Human Again.",
        color: "#DCE5EB", accent: "#D2322B", ink: "#56616B", height: 1.0, width: 1.0,
      },
      {
        title: "Make, Think, Imagine", author: "John Browne",
        note: "Engineering the Future of Civilisation.",
        color: "#202020", accent: "#E8DCC2", height: 1.02, width: 0.95,
      },
      // Building
      {
        title: "Why the Lean Start-Up Changes Everything", author: "Steve Blank",
        note: "Harvard Business Review, May 2013.",
        color: "#F1EEE8", accent: "#B4232A", ink: "#1E1E1E", height: 0.92, width: 0.8,
      },
      // History and power
      {
        title: "The Ancient City", author: "Numa Denis Fustel de Coulanges", spineAuthor: "Fustel de Coulanges",
        note: "A Study on the Religion, Laws, and Institutions of Greece and Rome.",
        color: "#E7A18E", accent: "#1E1A1A", ink: "#1E1A1A", height: 0.98, width: 1.05, font: "serif",
      },
      {
        title: "The True Believer", author: "Eric Hoffer",
        note: "Thoughts on the Nature of Mass Movements.",
        color: "#C92F2A", accent: "#F2EEE8", height: 0.92, width: 0.75,
      },
      {
        title: "The Managerial Revolution", author: "James Burnham",
        note: "What Is Happening in the World.",
        color: "#1D1D1D", accent: "#C8322E", ink: "#E3C9B7", height: 1.0, width: 0.9, font: "serif",
      },
      {
        title: "The Machiavellians", author: "James Burnham",
        note: "Defenders of Freedom.",
        color: "#3E3A23", accent: "#C2A55A", ink: "#EDE3C7", height: 1.0, width: 0.9, font: "serif",
      },
      {
        title: "History Has Begun", author: "Bruno Maçães",
        note: "The Birth of a New America.",
        color: "#C51F2A", accent: "#F4F0E8", height: 1.0, width: 0.95, font: "serif",
      },
      {
        title: "Surprise, Kill, Vanish", author: "Annie Jacobsen",
        note: "The Secret History of CIA Paramilitary Armies, Operators, and Assassins.",
        color: "#2A2623", accent: "#D9783A", ink: "#EFE7DC", height: 1.06, width: 1.15,
      },
      // The inner life
      {
        title: "A New Earth", author: "Eckhart Tolle",
        note: "Awakening to Your Life’s Purpose.",
        color: "#F0A12F", accent: "#1F2A44", ink: "#1F2A44", height: 0.98, width: 0.95, font: "serif",
      },
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
