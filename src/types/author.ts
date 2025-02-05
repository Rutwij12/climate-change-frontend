export interface Author {
    id: number
    name: string
    hIndex: number
    institution: string
    funding: string[]
    recentPapers: {
      title: string
      year: number
      journal: string
    }[]
    coAuthors: {
      name: string
      collaborations: number
    }[]
  }
  
  