/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppShell } from './app/AppShell';
import { StudioProviders } from './app/providers';

export default function App() {
  return (
    <StudioProviders>
      <AppShell />
    </StudioProviders>
  );
}

