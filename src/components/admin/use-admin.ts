import { useMemo } from 'react';

import { CURRENT_ADMIN_ID, type Hub, type Merchant, type Rider } from '@/data/ops';
import { useOps } from '@/state/ops-state';

/**
 * Operations data plus the signed-in staff member (used as the audit-log actor) and id lookups.
 * Until staff auth exists, the Admin role maps to the Super Admin account `CURRENT_ADMIN_ID`.
 */
export function useAdmin() {
  const { data, dispatch, reset } = useOps();
  const me = data.staff.find((s) => s.id === CURRENT_ADMIN_ID) ?? data.staff[0];

  const lookup = useMemo(
    () => ({
      merchant: new Map<string, Merchant>(data.merchants.map((m) => [m.id, m])),
      rider: new Map<string, Rider>(data.riders.map((r) => [r.id, r])),
      hub: new Map<string, Hub>(data.hubs.map((h) => [h.id, h])),
    }),
    [data.merchants, data.riders, data.hubs],
  );

  return { data, dispatch, reset, me, actor: me.name, lookup };
}
