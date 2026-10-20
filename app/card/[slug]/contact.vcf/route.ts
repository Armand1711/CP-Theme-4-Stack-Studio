import { getTeamMember, team } from "@/lib/content";
import { toVCard } from "@/lib/vcard";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return team.map((m) => ({ slug: m.slug }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const member = getTeamMember((await params).slug);
  if (!member) return new Response("Not found", { status: 404 });

  return new Response(toVCard(member), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${member.slug}-stack-studio.vcf"`,
    },
  });
}
