import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  ArrowRight,
  ExternalLink,
  Compass,
} from "lucide-react";
import { AnimatedBookmarkButton } from "@/components/deals/AnimatedBookmarkButton";
import { useBookmarkStore } from "@/stores/bookmarkStore";

export type Department = string;

export interface JobListing {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salaryRange: string;
  department: Department;
  href?: string;
  tags?: string[];
  deal?: any; // TourDeal object for bookmarking
}

export interface Career3Props {
  eyebrow?: string;
  heading: string;
  subheading?: string;
  departments: Department[];
  jobs: JobListing[];
  exploreLabel?: string;
  exploreHref?: string;
  emptyMessage?: string;
}

interface JobCardProps {
  job: JobListing;
}

function JobCard({ job }: JobCardProps) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarkStore();
  
  const handleBookmarkToggle = () => {
    if (isBookmarked(job.id)) {
      removeBookmark(job.id);
    } else if (job.deal) {
      addBookmark(job.deal);
    }
  };

  return (
    <div className="group bg-card text-card-foreground flex flex-col overflow-hidden rounded-lg border shadow-sm transition-all duration-300">
      <div className="bg-muted flex flex-1 flex-col gap-4 rounded-lg px-5 pt-4 pb-5 shadow-sm duration-300">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-border bg-background px-3 py-0.5 text-xs font-medium text-muted-foreground">
            {job.type}
          </span>
          <div className="flex items-center gap-2">
            <AnimatedBookmarkButton
              isBookmarked={isBookmarked(job.id)}
              onClick={handleBookmarkToggle}
            />
            <span className="text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-1.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Compass className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xl leading-snug font-semibold">
              {job.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {job.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-background px-3 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <p className="text-sm font-bold">
            {job.salaryRange}
          </p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {job.location}
          </p>
        </div>
        <a
          href={job.href ?? "#"}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Details
        </a>
      </div>
    </div>
  );
}

export default function Career3({
  eyebrow = "Discover your next adventure",
  heading,
  subheading,
  departments,
  jobs,
  exploreLabel = "View all tours",
  exploreHref = "#",
  emptyMessage = "No tours found in this category right now.",
}: Career3Props) {
  const [active, setActive] = useState<Department>(departments[0] ?? "");

  const filtered = active === "All" ? jobs : jobs.filter((j) => j.department === active);

  return (
    <section className="mx-auto w-full h-full max-w-5xl px-0 py-16 sm:py-20">
      <div className="flex flex-col items-center text-center">
        <Badge
          variant="outline"
          className="mb-4 rounded-full px-4 py-1 text-xs font-medium tracking-wide"
        >
          {eyebrow}
        </Badge>

        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          {heading}
        </h1>

        {subheading && (
          <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            {subheading}
          </p>
        )}
      </div>

      <div className="mt-10 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActive(dept)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                active === dept
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-14 flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Looking for something else?
        </p>
        <Button
          variant="link"
          asChild
          className="group h-auto gap-1.5 p-0 text-sm font-semibold hover:no-underline"
        >
          <a href={exploreHref}>
            {exploreLabel}
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </Button>
      </div>
    </section>
  );
}
