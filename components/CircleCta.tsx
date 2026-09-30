import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Magnetic } from "./Magnetic";
import { SpecularButton } from "./SpecularButton";

/**
 * Round orange call to action with "Start a Project" circling it on a slow spin (faster on hover).
 * The ring is decorative; the button carries the accessible name.
 */
export function CircleCta() {
  return (
    <Magnetic strength={0.3} radius={140}>
      <span className="circle-cta">
        <svg className="circle-cta__ring" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <path id="circle-cta-path" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
          </defs>
          <text>
            <textPath href="#circle-cta-path" textLength="510">
              Start a Project · Start a Project ·
            </textPath>
          </text>
        </svg>
        <SpecularButton href="/contact" autoAnimate className="circle-cta__btn" aria-label="Start a Project">
          <ArrowUpRight size={40} weight="bold" aria-hidden />
        </SpecularButton>
      </span>
    </Magnetic>
  );
}
