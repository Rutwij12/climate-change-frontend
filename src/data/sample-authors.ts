import type { Author } from "../types/author"

export const authors: Author[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    hIndex: 45,
    institution: "Stanford University",
    funding: ["National Science Foundation", "Department of Energy", "DARPA"],
    recentPapers: [
      {
        title: "Machine Learning Applications in Climate Modeling",
        year: 2023,
        journal: "Nature Climate Change",
      },
      {
        title: "Advanced Neural Networks for Weather Prediction",
        year: 2023,
        journal: "Science Advances",
      },
      {
        title: "Deep Learning in Environmental Science",
        year: 2022,
        journal: "Environmental Science & Technology",
      },
    ],
    coAuthors: [
      { name: "Dr. Michael Chen", collaborations: 15 },
      { name: "Dr. Emily Williams", collaborations: 12 },
      { name: "Dr. David Kim", collaborations: 8 },
    ],
  },
  {
    id: 2,
    name: "Prof. James Anderson",
    hIndex: 52,
    institution: "MIT",
    funding: ["NASA", "European Research Council", "Gates Foundation"],
    recentPapers: [
      {
        title: "Quantum Computing in Climate Simulation",
        year: 2023,
        journal: "Science",
      },
      {
        title: "Next-Generation Climate Models",
        year: 2023,
        journal: "Nature",
      },
      {
        title: "Artificial Intelligence in Earth Science",
        year: 2022,
        journal: "PNAS",
      },
    ],
    coAuthors: [
      { name: "Dr. Lisa Thompson", collaborations: 20 },
      { name: "Dr. Robert Garcia", collaborations: 16 },
      { name: "Dr. Sarah Johnson", collaborations: 10 },
    ],
  },
]

