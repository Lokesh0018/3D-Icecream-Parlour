import Loader from "@/components/engine/Loader";
import Cursor from "@/components/engine/Cursor";
import SmoothScroll from "@/components/engine/SmoothScroll";
import Animations from "@/components/engine/Animations";
import RecordMode from "@/components/engine/RecordMode";
import SitePage from "@/site/Page";
import { meta } from "@/site/site";
import SEO from "@/site/components/SEO";

import { ContentProvider } from "@/site/contentContext";

// Engine (same for every site) + the site's own page from site/.
export default function Home() {
  return (
    <>
      <SEO />
      <Loader text={meta.loaderText ?? meta.name} enabled={meta.loader ?? true} />
      <SmoothScroll />
      <Animations />
      <RecordMode speed={meta.record?.speed} duration={meta.record?.duration} delay={meta.record?.delay} />
      {meta.cursor !== false && <Cursor />}
      <ContentProvider>
        <SitePage />
      </ContentProvider>
    </>
  );
}
