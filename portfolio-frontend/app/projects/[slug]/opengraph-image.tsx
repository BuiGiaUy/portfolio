import { ImageResponse } from "next/og";
import { getProjectBySlug } from "@/lib/api/server-api";

// Image dimensions (standard OG image size)
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Route segment config
export const runtime = "edge";

interface OGImageProps {
  params: Promise<{ slug: string }>;
}

export default async function OGImage({ params }: OGImageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    // Return a fallback image for not found projects
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div
            style={{
              color: "#888888",
              fontSize: 48,
              fontWeight: 600,
            }}
          >
            Project Not Found
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // Limit tech stack display
  const displayTechStack = project.techStack.slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 60,
          fontFamily: "Inter, sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative gradient circles */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(129, 140, 248, 0.2) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            zIndex: 1,
          }}
        >
          {/* Author/Site name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#6366f1",
                marginRight: 12,
              }}
            />
            <span
              style={{
                color: "#a1a1aa",
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: "0.05em",
              }}
            >
              BÙI GIA UY • PORTFOLIO
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#fafafa",
              lineHeight: 1.1,
              marginBottom: 24,
              maxWidth: 900,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {project.title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              lineHeight: 1.4,
              marginBottom: 40,
              maxWidth: 800,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {project.shortDescription}
          </div>

          {/* Tech Stack */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: "auto",
            }}
          >
            {displayTechStack.map((tech) => (
              <div
                key={tech}
                style={{
                  background: "rgba(99, 102, 241, 0.15)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 18,
                  color: "#a5b4fc",
                  fontWeight: 500,
                }}
              >
                {tech}
              </div>
            ))}
            {project.techStack.length > 5 && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 18,
                  color: "#71717a",
                  fontWeight: 500,
                }}
              >
                +{project.techStack.length - 5} more
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
