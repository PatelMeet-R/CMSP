import React from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { ElementType } from "react";

// Define what a single "crumb" looks like
export interface BreadcrumbPath {
  label: string;
  /** Pass an href to use a real React Router Link */
  href?: string;
  /** Pass an onClick if you want to use navigate(-1) or custom logic */
  onClick?: () => void;
  /** Optional Lucide Icon */
  icon?: ElementType;
  /** Shows a skeleton loader for this specific segment */
  isLoading?: boolean;
}

interface PageBreadcrumbProps {
  items: BreadcrumbPath[];
}

export const PageBreadcrumb = ({ items }: PageBreadcrumbProps) => {
  return (
    <div className="pb-2 border-b mb-6">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const Icon = item.icon;

            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {/* 1. If it's loading, show the Skeleton */}
                  {item.isLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : /* 2. If it's the very last item, it's just text (not clickable) */
                  isLast ? (
                    <BreadcrumbPage className="flex items-center gap-1.5 font-medium">
                      {Icon && <Icon className="w-4 h-4 shrink-0" />}
                      {item.label}
                    </BreadcrumbPage>
                  ) : /* 3. If it has an href, render a proper React Router Link */
                  item.href ? (
                    <BreadcrumbLink asChild>
                      <Link
                        to={item.href}
                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                      >
                        {Icon && <Icon className="w-4 h-4 shrink-0" />}
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    /* 4. If it has an onClick (like navigate(-1)), render a button */
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors text-muted-foreground"
                    >
                      {Icon && <Icon className="w-4 h-4 shrink-0" />}
                      {item.label}
                    </button>
                  )}
                </BreadcrumbItem>

                {/* Add Shadcn's automatic separator if it's not the last item */}
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
