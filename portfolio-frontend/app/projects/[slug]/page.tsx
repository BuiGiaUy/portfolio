import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/api/server-api";
import ProjectDetailContent from "./ProjectDetailContent";

// Site configuration
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
const SITE_NAME = "Bùi Gia Uy | Portfolio";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate dynamic metadata for SEO
 * This runs on the server and provides title, description, OG tags
 */
export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | " + SITE_NAME,
      description: "The requested project could not be found.",
    };
  }

  const title = `${project.title} | ${SITE_NAME}`;
  const description = project.shortDescription;
  const url = `${SITE_URL}/projects/${project.slug}`;

  return {
    title,
    description,
    keywords: [
      ...project.techStack,
      "fullstack",
      "backend",
      "portfolio",
      "project",
    ],
    authors: [{ name: "Bùi Gia Uy" }],
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      images: [
        {
          url: `${SITE_URL}/projects/${project.slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/projects/${project.slug}/opengraph-image`],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Project Detail Page (Server Component)
 * Fetches project data on the server and passes to client component
 */
export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailContent project={project} />;
}
