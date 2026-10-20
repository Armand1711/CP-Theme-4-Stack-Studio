import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DownloadSimple, EnvelopeSimple, LinkedinLogo, Phone } from "@phosphor-icons/react/dist/ssr";
import { PageTransition } from "@/components/PageTransition";
import ProfileCard from "@/components/ProfileCard";
import { contactDetails, getTeamMember, team } from "@/lib/content";
import { vcardHref } from "@/lib/site";

/*
 * Digital business card: where each team member's QR code lands. Built for a phone held in one
 * hand: the card, then a big "Save contact" (a .vcf the phone imports), then direct actions.
 * Standalone on purpose: no site header, footer or links back, and kept out of search results.
 */

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return team.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const member = getTeamMember((await params).slug);
  return member ? { title: member.name, description: `${member.role} at Stack Studio.`, robots: { index: false, follow: false } } : {};
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export default async function CardPage({ params }: Props) {
  const member = getTeamMember((await params).slug);
  if (!member) notFound();

  return (
    <PageTransition>
      <section className="wrap bizcard">
        <div className="hero__glow" aria-hidden="true" />
        <ProfileCard
          className="bizcard__card"
          name={member.name}
          title={member.role}
          showUserInfo={false}
          avatarUrl={member.photo}
          iconUrl="/brand/stack-studio-pattern.svg"
          backdropColor="#1b1a19"
          holo={0.7}
          glare={0.45}
          enableMobileTilt
        />

        <div className="bizcard__actions">
          <a href={vcardHref(member.slug)} download className="btn btn--primary bizcard__save">
            <DownloadSimple size={18} weight="bold" aria-hidden />
            Save contact
          </a>
          <div className="bizcard__quick">
            <a href={`mailto:${member.email}`} className="btn btn--ghost">
              <EnvelopeSimple size={18} weight="bold" aria-hidden />
              Email
            </a>
            <a href={telHref(member.phone)} className="btn btn--ghost">
              <Phone size={18} weight="bold" aria-hidden />
              Call
            </a>
            {member.linkedin && (
              <a href={member.linkedin} className="btn btn--ghost" target="_blank" rel="noopener noreferrer">
                <LinkedinLogo size={18} weight="bold" aria-hidden />
                LinkedIn
              </a>
            )}
          </div>
        </div>

        <dl className="bizcard__details surface">
          <div>
            <dt className="meta__label">Email</dt>
            <dd className="meta__value">{member.email}</dd>
          </div>
          <div>
            <dt className="meta__label">Phone</dt>
            <dd className="meta__value">{member.phone}</dd>
          </div>
          <div>
            <dt className="meta__label">Based in</dt>
            <dd className="meta__value">{contactDetails.location}</dd>
          </div>
          <div className="bizcard__bio">
            <dt className="meta__label">About</dt>
            <dd className="body-2">{member.bio}</dd>
          </div>
        </dl>
      </section>
    </PageTransition>
  );
}
