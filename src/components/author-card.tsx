import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Author } from "../types/author"

interface AuthorCardProps {
  author: Author
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto bg-[#E8F5E9]">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-[#447A48] mb-2">{author.name}</h2>
              <p className="text-xl text-secondary-foreground">{author.institution}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">H-Index</h3>
              <div className="text-3xl font-bold text-secondary-foreground">{author.hIndex}</div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">Funding Sources</h3>
              <div className="flex flex-wrap gap-2">
                {author.funding.map((fund) => (
                  <Badge key={fund} variant="secondary" className="bg-[#447A48] text-white hover:bg-[#447A48]/90">
                    {fund}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">Recent Papers</h3>
              <ScrollArea className="h-[200px] rounded-md border border-[#447A48]/20 p-4">
                <div className="space-y-4">
                  {author.recentPapers.map((paper) => (
                    <div key={paper.title} className="space-y-1">
                      <p className="font-medium text-secondary-foreground">{paper.title}</p>
                      <p className="text-sm text-secondary-foreground/80">
                        {paper.journal} ({paper.year})
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">Frequent Co-Authors</h3>
              <ScrollArea className="h-[150px] rounded-md border border-[#447A48]/20 p-4">
                <div className="space-y-3">
                  {author.coAuthors.map((coAuthor) => (
                    <div key={coAuthor.name} className="flex justify-between items-center">
                      <span className="text-secondary-foreground">{coAuthor.name}</span>
                      <Badge variant="outline" className="bg-primary/10">
                        {coAuthor.collaborations} papers
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

