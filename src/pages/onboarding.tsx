import { CONFIG } from 'src/config-global';

import { OnboardingView } from 'src/sections/onboarding';

// ----------------------------------------------------------------------

export default function OnboardingPage() {
  return (
    <>
      <title>{`Ativar Benefício - ${CONFIG.appName}`}</title>
      <meta name="description" content="Ative seu benefício de visão Plenivi" />

      <OnboardingView />
    </>
  );
}
