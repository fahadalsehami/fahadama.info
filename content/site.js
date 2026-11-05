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
     "complex" (a cell complex), "session", "leaderboard", "chart", "globe"
     or "consensus". */
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
        title: "Deep Thinking", author: "Garry Kasparov",
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
