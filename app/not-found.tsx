import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { SpecularButton } from "@/components/SpecularButton";
import { PageTransition } from "@/components/PageTransition";
import { StackVisual } from "@/components/StackVisual";

export default function NotFound() {
  return (
    <PageTransition>
      <section className="wrap hero hero--inner not-found">
        <div className="hero__copy load-in">
          <p className="eyebrow" style={{ "--i": 0 } as React.CSSProperties}>
            404
          </p>
          <h1 className="display display--h1" style={{ "--i": 1 } as React.CSSProperties}>
            This page <em>isn&apos;t here.</em>
          </h1>
          <p className="lede" style={{ "--i": 2 } as React.CSSProperties}>
            The link may be old or mistyped. Everything we do is one click from the home page.
          </p>
          <div style={{ "--i": 3 } as React.CSSProperties}>
            <SpecularButton href="/" className="btn btn--ghost">
              <ArrowLeft size={16} weight="bold" aria-hidden />
              Back to home
            </SpecularButton>
          </div>
        </div>
        {/* One layer has slid off the stack; tapping it puts it back. */}
        <StackVisual lost />
      </section>
    </PageTransition>
  );
}
